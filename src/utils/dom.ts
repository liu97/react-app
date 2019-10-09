interface INodeStyle {
    visibility: string | null,
    display: string | null
}

export const contains = (root: Node, n: Node) => {
    var node: Node | null = n;
    while (node) {
        if (node === root) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

export const getStyles = function (elem: HTMLElement) {
    var view: any = elem && elem.ownerDocument && elem.ownerDocument.defaultView;
    if (!view || !view.opener) {
        view = window;
    }
    return view.getComputedStyle(elem);
};

export const getSize = (elem: HTMLElement) => {
    let getNoneNode = function (node: HTMLElement | null) {
        if (node) {
            var display: string = getStyles(node).getPropertyValue('display'),
                tagName: string = node.nodeName.toLowerCase();
            if (display != 'none'
                && tagName != 'body') {
                getNoneNode(node.parentNode as HTMLElement);
            } else {
                noneNodes.push(node);
                if (tagName != 'body') {
                    getNoneNode(node.parentNode as HTMLElement);
                }
            }
        }
    }

    let setNodeStyle = function () {
        let i = 0;
        for (; i < noneNodes.length; i++) {
            var visibility = noneNodes[i].style.visibility,
                display = noneNodes[i].style.display,
                style = noneNodes[i].getAttribute("style");
            //覆盖其他display样式
            noneNodes[i].setAttribute("style", "visibility:hidden;display:block !important;" + style);
            nodeStyle[i] = {
                visibility: visibility,
                display: display
            }
        }
    }
    let resumeNodeStyle = function () {
        var i = 0;
        for (; i < noneNodes.length; i++) {
            noneNodes[i].style.visibility = nodeStyle[i].visibility;
            noneNodes[i].style.display = nodeStyle[i].display;
        }
    }
    let width: number,
        height: number,
        // elem = document.getElementById(id),
        noneNodes: HTMLElement[] = [],
        nodeStyle: INodeStyle[] = [];
    getNoneNode(elem); //获取多层display：none;的元素
    setNodeStyle();
    width = elem.clientWidth;
    height = elem.clientHeight;
    resumeNodeStyle();
    return {
        width: width,
        height: height
    }
}