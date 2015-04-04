function removeAllChildren(node) {
    /*node.children.forEach(function(child) {
        node.removeChild(child);
    });*/
    /*for(var i=0;i<node.childElementCount;++i) {
        node.removeChild(node.children[i]);
    }*/
    while (node.hasChildNodes()) {
        node.removeChild(node.lastChild);
    }
}