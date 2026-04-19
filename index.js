const fs = require('fs-extra');
const path = require('path');
const mustache = require('mustache');
const { marked } = require('marked');
const matter = require('gray-matter');
const markedKatex = require('marked-katex-extension');

// 2. 配置 marked 使用插件
marked.use(markedKatex({
    throwOnError: false,
    displayMode: false
}));

const args = process.argv.slice(2);
const command = args[0];

const PATHS = {
    post: path.join(process.cwd(), 'post'),
    public: path.join(process.cwd(), 'public'),
    articleTpl: path.join(process.cwd(), 'assets/template.html'),
    indexTpl: path.join(process.cwd(), 'assets/index.html'),
    indexCss: path.join(process.cwd(), 'assets/index.css'),
    postCss: path.join(process.cwd(), 'assets/post.css')
};

async function _clean() {
    try {
        console.log('🧹 FoxGen: 正在清理发布目录...');
        await fs.emptyDir(PATHS.public);
        console.log('✨ 清理完毕！');
        return true;
    } catch (e) {
        console.error('❌ 清理失败:', e.message);
        console.error('   请检查 public 目录权限');
        return false;
    }
}

async function _generate() {
    try {
        console.log('🚀 FoxGen: 启动静态网站生成...');

        if (!await fs.pathExists(PATHS.post)) {
            console.error('❌ post 目录不存在，请先运行 "npm run new" 创建文章');
            return false;
        }

        await fs.emptyDir(PATHS.public);

        if (!await fs.pathExists(PATHS.articleTpl)) {
            console.error('❌ 模板文件不存在: assets/template.html');
            return false;
        }
        if (!await fs.pathExists(PATHS.indexTpl)) {
            console.error('❌ 模板文件不存在: assets/index.html');
            return false;
        }

        const articleTpl = await fs.readFile(PATHS.articleTpl, 'utf-8');
        const indexTpl = await fs.readFile(PATHS.indexTpl, 'utf-8');
        const files = (await fs.readdir(PATHS.post)).filter(f => f.endsWith('.md'));

        if (files.length === 0) {
            console.warn('⚠️ post 目录中没有找到任何 .md 文件');
            console.warn('   请先运行 "npm run new <标题>" 创建文章');
            return false;
        }

        const tagsIndex = {}; 

        // 1. 生成文章页
        for (const file of files) {
            try {
                const fileContent = await fs.readFile(path.join(PATHS.post, file), 'utf-8');
                const { data, content } = matter(fileContent);
                const htmlContent = marked.parse(content);
                const outputName = file.replace('.md', '.html');
                const rawDate = data.time ? new Date(data.time) : new Date();

                if (isNaN(rawDate.getTime())) {
                    console.warn(`⚠️ 文章 "${file}" 的日期格式无效，使用当前日期`);
                }

                const viewData = {
                    title: data.title || '无标题',
                    tags: Array.isArray(data.tags) ? data.tags : [],
                    time: rawDate.toISOString().split('T')[0],
                    author: data.author || 'Admin',
                    content: htmlContent
                };

                viewData.tags.forEach(tag => {
                    if (!tagsIndex[tag]) tagsIndex[tag] = [];
                    tagsIndex[tag].push({ title: viewData.title, url: outputName });
                });

                const rendered = mustache.render(articleTpl, viewData);
                await fs.writeFile(path.join(PATHS.public, outputName), rendered);
                console.log(`   ✓ 生成文章: ${viewData.title}`);
            } catch (e) {
                console.error(`❌ 处理文件 "${file}" 失败:`, e.message);
            }
        }

        // 2. 生成倒排索引 JSON
        await fs.writeJson(path.join(PATHS.public, 'search-index.json'), tagsIndex);
        console.log('   ✓ 生成搜索索引');
        
        // 3. 生成首页
        const renderedIndex = mustache.render(indexTpl, { title: "FoxGen - 搜索" });
        await fs.writeFile(path.join(PATHS.public, 'index.html'), renderedIndex);
        console.log('   ✓ 生成首页');

        // 4. 拷贝 CSS
        if (await fs.pathExists(PATHS.indexCss)) {
            await fs.copy(PATHS.indexCss, path.join(PATHS.public, 'index.css'));
            console.log('   ✓ 复制 index.css');
        }
        if (await fs.pathExists(PATHS.postCss)) {
            await fs.copy(PATHS.postCss, path.join(PATHS.public, 'post.css'));
            console.log('   ✓ 复制 post.css');
        }
        
        console.log('✨ FoxGen: 构建成功！');
        return true;
    } catch (e) {
        console.error('❌ 构建失败:', e.message);
        console.error('   详细错误:', e.stack);
        return false;
    }
}

function sanitizeFileName(title) {
    return title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[<>:"/\\|?*]/g, '')
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u001f\u007f-\u009f]/g, '')
        .replace(/\.+/g, '.')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        || 'untitled';
}

async function _new() {
    try {
        const title = args[1];
        
        if (!title) {
            console.error('❌ 请提供文章标题');
            console.error('   用法: npm run new "文章标题"');
            return false;
        }

        const fileName = `${sanitizeFileName(title)}.md`;
        const filePath = path.join(PATHS.post, fileName);

        if (await fs.pathExists(filePath)) {
            console.error(`❌ 文件已存在: ${fileName}`);
            console.error('   请使用不同的标题或删除现有文件');
            return false;
        }

        await fs.ensureDir(PATHS.post);
        
        const content = `---
title: ${title}
tags: []
time: ${new Date().toISOString().split('T')[0]}
author: Admin
---

# ${title}

在这里编写你的文章内容...`;

        await fs.writeFile(filePath, content, 'utf-8');
        console.log(`✅ 已创建文章: ${fileName}`);
        console.log(`   路径: ${filePath}`);
        return true;
    } catch (e) {
        console.error('❌ 创建文章失败:', e.message);
        console.error('   详细错误:', e.stack);
        return false;
    }
}

async function main() {
    const validCommands = ['gen', 'new', 'clean'];
    
    if (!command) {
        console.error('❌ 请指定命令');
        console.error('   可用命令: gen, new, clean');
        console.error('   用法: npm run <command>');
        process.exitCode = 1;
        return;
    }

    if (!validCommands.includes(command)) {
        console.error(`❌ 未知命令: ${command}`);
        console.error('   可用命令: gen, new, clean');
        process.exitCode = 1;
        return;
    }

    let success = false;
    
    if (command === 'gen') {
        success = await _generate();
    } else if (command === 'new') {
        success = await _new();
    } else if (command === 'clean') {
        success = await _clean();
    }

    if (!success) {
        process.exitCode = 1;
    }
}

main().catch(e => {
    console.error('❌ 未捕获的错误:', e.message);
    console.error('   堆栈:', e.stack);
    process.exitCode = 1;
});