windowFactory = function() {
    function create(id, pid, title) {
        if(id === undefined || id === null)
           throw "Parameter id is not set";

        if(pid === undefined || pid === null)
            throw "Parameter pid is not set";

        if(title === undefined || title === null)
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
    }

    return {
        create : create
    };
}();

module.exports = windowFactory;