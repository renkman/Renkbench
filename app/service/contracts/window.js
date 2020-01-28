create = function(id, pid, title) {
    if(!id)
        throw "Parameter id is not set";

    if(!pid)
        throw "Parameter pid is not set";

    if(!title)
        throw "Parameter title is not set";

    return {
        id : id,
        pid : pid,
        icons : {
            image : {},
            imageSelected : {}
        },
        window : {
            title : title
        }
    };
}();

module.exports = create;