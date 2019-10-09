const isValidFileType = (rules: string[], filename: string) => {
    if (!rules || !rules.length || !filename) {
        return false;
    }
    const fileNameArr: string[] = filename.split('.');
    let isValidFileType: boolean = false;

    let fileType: string;
    const fileNameArrLen: number = fileNameArr.length;
    if (fileNameArr && fileNameArrLen > 1) {
        fileType = fileNameArr[fileNameArrLen - 1].toLowerCase();
    }

    isValidFileType = rules.some(rule => rule.toLowerCase().indexOf(fileType) > -1);
    return isValidFileType;
}

const getImageSpaceByFile = (file: object) => {
    return new Promise((res, rej) => {
        var img: HTMLImageElement = new Image();
        img.onload = function () {
            res({
                width: img.width,
                height: img.height
            })
            URL.revokeObjectURL(img.src);
        }
        var objectURL: string = URL.createObjectURL(file);
        img.src = objectURL;
    })
}

const convertImgToBase64 = (url: string, outputDWidth: number = 50, outputDHeight: number = 50, outputFormat: string = 'image/png') => { // 正方形切割
    return new Promise((resolve, reject) => {
        let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.createElement('CANVAS'),
            ctx: CanvasRenderingContext2D | null = canvas.getContext('2d'),
            img: HTMLImageElement = new Image;
        img.crossOrigin = 'Anonymous';
        img.onload = function () {
            let sx = 0,
                sy = 0,
                sWidth = img.width,
                sHeight = img.height;
            if (img.height > img.width) {
                sy = (img.height - img.width) / 2;
                sHeight = img.width;
            } else {
                sx = (img.width - img.height) / 2;
                sWidth = img.height;
            }

            canvas.height = outputDWidth;
            canvas.width = outputDHeight;

            ctx && ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
            var dataURL = canvas.toDataURL(outputFormat);
            resolve(dataURL);
        };
        img.src = url;

        setTimeout(() => {
            resolve(null);
        }, 5000)
    })
}

export { isValidFileType, getImageSpaceByFile, convertImgToBase64 };