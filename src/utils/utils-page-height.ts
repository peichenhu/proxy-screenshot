export default function getPageHeight(width = 0, height = 0) {
    // ===== 重置视口为标准视口 ======
    // const content = 'width=device-width, minimum-scale=1.0, maximum-scale=1.0, initial-scale=1.0';
    // let viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    // if (viewport) {
    //     viewport.content = content;
    // } else {
    //     viewport = document.createElement('meta');
    //     viewport.name = 'viewport';
    //     viewport.content = content;
    //     document.head.appendChild(viewport);
    // }

    // ===== 获取页面真实高度 =====
    let maxHeight = height;
    const getStyle = (el: Element, style: string) => window.getComputedStyle(el).getPropertyValue(style);
    document.querySelectorAll('*').forEach(el => {
        const sh = Array.from(el.children).reduce((sh, child: Element) => {
            const position = getStyle(child, 'position');
            const flo = getStyle(child, 'position');
            if (position !== 'fixed' && position !== 'absolute') {
                sh += child.clientHeight;
            }
            return sh;
        }, 0);
        maxHeight = Math.max(maxHeight, sh);
    });
    // console.log('maxHeight', maxHeight);
    return maxHeight;
}
