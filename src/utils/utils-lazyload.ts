export default function preloadImage({ timeout }: Record<string, number>) {
    const images = Array.from(document.querySelectorAll('img'));
    const loadImage = (img: HTMLImageElement) => {
        const res = {
            timeout,
            success: true,
            src: '',
        };
        return new Promise(resolve => {
            res.src = img.src;
            const timer = setTimeout(() => {
                res.success = false;
                resolve(res);
            }, timeout);

            if (img.complete) {
                clearTimeout(timer);
                resolve(res);
            }
            img.onload = () => {
                clearTimeout(timer);
                resolve(res);
            };
            img.onerror = () => {
                res.success = false;
                clearTimeout(timer);
                resolve(res);
            };
        });
    };
    return Promise.all(images.map(img => loadImage(img)));
}
