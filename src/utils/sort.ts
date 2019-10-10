interface IObj {
    [key: string]: any
}


export const sortNumber = (key: string) => (a: IObj, b: IObj) => a[key] - b[key]

export const sortPercent = (key: string) => (a: IObj, b: IObj) => parseFloat(a[key]) - parseFloat(b[key])

export const sortLength = (key: string) => (a: IObj, b: IObj) => a[key].length - b[key].length