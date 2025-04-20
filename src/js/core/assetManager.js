class AssetManager {
    constructor() {
        this.images = new Map();
        this.loadedImages = 0;
        this.totalImages = 0;
    }

    loadImage(name, src) {
        this.totalImages++;
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images.set(name, img);
                this.loadedImages++;
                resolve(img);
            };
            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
        });
    }

    getImage(name) {
        return this.images.get(name);
    }

    isAllLoaded() {
        return this.loadedImages === this.totalImages;
    }
}