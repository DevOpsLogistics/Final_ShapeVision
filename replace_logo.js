const fs = require('fs');

// For simple <div className={styles.logo}>ShapeVision</div>
// For <Link ...>ShapeVision</Link>

const replaceLogo = (content, filePath) => {
    let newContent = content;

    // Simple textual "ShapeVision" inside styles.logo or Link
    newContent = newContent.replace(
        /<div className=\{styles\.logo\}>ShapeVision<\/div>/g,
        '<div className={styles.logo} style={{display: "flex", alignItems: "center", gap: "8px"}}><img src="/logo.png" alt="ShapeVision Logo" height="32" /> <span>ShapeVision</span></div>'
    );
    
    newContent = newContent.replace(
        /<Link href="([^"]+)" className=\{styles\.logo\}([^>]*)>ShapeVision<\/Link>/g,
        '<Link href="$1" className={styles.logo}$2 style={{display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "inherit"}}><img src="/logo.png" alt="ShapeVision Logo" height="32" /> <span>ShapeVision</span></Link>'
    );

    // Some files have <div className={styles.logoIcon}> ... </div> before ShapeVision
    // We can use a regex to match the logoIcon block and the text.
    
    // For upload/page.tsx, multi-detect/page.tsx, etc.
    const complexRegex = /<div className=\{styles\.logoIcon\}>\s*<div className=\{styles\.logoShape\}><\/div>\s*<\/div>\s*ShapeVision/g;
    newContent = newContent.replace(
        complexRegex,
        '<img src="/logo.png" alt="ShapeVision Logo" height="32" style={{marginRight: "8px"}} />\n          ShapeVision'
    );

    // For camera/page.tsx
    const cameraRegex = /<div className=\{styles\.logoIcon\}>\s*<div className=\{styles\.logoShape\}><\/div>\s*<\/div>\s*ShapeVision Camera Workspace/g;
    newContent = newContent.replace(
        cameraRegex,
        '<img src="/logo.png" alt="ShapeVision Logo" height="32" style={{marginRight: "8px"}} />\n          ShapeVision Camera Workspace'
    );
    
    // For active-learning/page.tsx
    const activeRegex = /<div className=\{styles\.logoIcon\}>\s*<div className=\{styles\.logoShape\}><\/div>\s*<\/div>\s*<Link href="\/dashboard" className=\{styles\.brandName\} style=\{\{textDecoration: 'none', color: 'inherit'\}\}>ShapeVision<\/Link>/g;
    newContent = newContent.replace(
        activeRegex,
        '<img src="/logo.png" alt="ShapeVision Logo" height="32" style={{marginRight: "8px"}} />\n          <Link href="/dashboard" className={styles.brandName} style={{textDecoration: \'none\', color: \'inherit\'}}>ShapeVision</Link>'
    );
    
    // For docs/page.tsx
    const docsRegex = /ShapeVision <span style=\{\{fontWeight: 400, opacity: 0\.8, fontSize: 14, marginLeft: 8\}\}>Documentation<\/span>/g;
    newContent = newContent.replace(
        docsRegex,
        '<img src="/logo.png" alt="ShapeVision Logo" height="32" style={{marginRight: "8px"}} /> ShapeVision <span style={{fontWeight: 400, opacity: 0.8, fontSize: 14, marginLeft: 8}}>Documentation</span>'
    );

    // For analysis/page.tsx
    const analysisRegex = /ShapeVision <span className=\{styles\.topbarSubtitle\}>Deep Analysis Workspace<\/span>/g;
    newContent = newContent.replace(
        analysisRegex,
        '<img src="/logo.png" alt="ShapeVision Logo" height="32" style={{marginRight: "8px"}} /> ShapeVision <span className={styles.topbarSubtitle}>Deep Analysis Workspace</span>'
    );
    
    // For 3d/page.tsx
    const tdRegex = /ShapeVision 3D Workspace/g;
    newContent = newContent.replace(
        tdRegex,
        '<div style={{display: "flex", alignItems: "center", gap: "8px"}}><img src="/logo.png" alt="ShapeVision Logo" height="32" /> <span>ShapeVision 3D Workspace</span></div>'
    );
    
    // For multi-detect/page.tsx
    const multiDetectSub = /ShapeVision <span className=\{styles\.topbarSubtitle\}>Multi-Detection Workspace<\/span>/g;
    newContent = newContent.replace(
        multiDetectSub,
        'ShapeVision <span className={styles.topbarSubtitle}>Multi-Detection Workspace</span>' // Wait, this one already has the complexRegex handling ShapeVision before it. But complexRegex replaces ShapeVision text. So this line might be messed up if complexRegex matched "ShapeVision" alone. 
    );
    // Actually, in multi-detect:
    // <div className={styles.logoIcon}> ... </div>
    // ShapeVision <span className={styles.topbarSubtitle}>Multi-Detection Workspace</span>
    // So complexRegex will replace "div logoIcon ... ShapeVision" to "img ... ShapeVision", preserving the span! This is perfect.

    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated ${filePath}`);
    }
};

const path = require('path');
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.tsx')) {
        arrayOfFiles.push(path.join(__dirname, dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles('src');
files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    replaceLogo(content, file);
});
