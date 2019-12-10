interface IAnyObj {
    [key: string]: any
}


export const sortNumber = (key: string | number) => (a: IAnyObj, b: IAnyObj) => a[key] - b[key]

export const sortPercent = (key: string | number) => (a: IAnyObj, b: IAnyObj) => parseFloat(a[key]) - parseFloat(b[key])

export const sortLength = (key: string | number) => (a: IAnyObj, b: IAnyObj) => a[key].length - b[key].length