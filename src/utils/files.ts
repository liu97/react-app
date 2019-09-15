const isValidFileType = (rules: string[], filename: string) => {
    if (!rules || !rules.length || !filename) {
        return false;
    }
    const fileNameArr = filename.split('.');
    let isValidFileType = false;

    let fileType: string;
    const fileNameArrLen = fileNameArr.length;
    if (fileNameArr && fileNameArrLen > 1) {
        fileType = fileNameArr[fileNameArrLen - 1].toLowerCase();
    }

    isValidFileType = rules.some(rule => rule.toLowerCase().indexOf(fileType) > -1);
    return isValidFileType;
}

const getImageSpaceByFile = (file: object) => {
    return new Promise((res, rej) => {
        var img = new Image();
        img.onload = function () {
            res({
                width: img.width,
                height: img.height
            })
            URL.revokeObjectURL(img.src);
        }
        var objectURL = URL.createObjectURL(file);
        img.src = objectURL;
    })

}

export { isValidFileType, getImageSpaceByFile };