const { createServer } = require("node:http");

let db = [
    {
        title: "The Broken Car",
        comedian: "Jerry Seinfeld",
        year: 1998,
        id: 1,
    },
    {
        title: "Why Did the Chicken Cross the Road?",
        comedian: "Various",
        year: 1920,
        id: 2,
    },
    {
        title: "The Pencil",
        comedian: "Louis C.K.",
        year: 2011,
        id: 3,
    },
    {
        title: "The Golf Joke",
        comedian: "Dave Chappelle",
        year: 2000,
        id: 4,
    },
    {
        title: "The Doctor's Office",
        comedian: "Ellen DeGeneres",
        year: 2001,
        id: 5,
    },
];

const getRequestHandler = (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.write(JSON.stringify({ status: "success", data: db }));
    res.end();
};

const postRequestHandler = (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 201;
    req.body = [];
    let jsonReqBody;
    req.on("data", (chunk) => {
        req.body.push(chunk);
    });
    req.on("end", () => {
        if (req.body.concat().toString() === "") {
            res.statusCode = 400;
            res.end(
                JSON.stringify({
                    status: "error",
                    message: "Please provide a body for the request.",
                })
            );
            return;
        }

        jsonReqBody = JSON.parse(req.body.concat().toString());
        db = [...db, jsonReqBody];
        res.end(JSON.stringify({ status: "success", data: db }));
    });
};

const patchRequestHandler = (req, res) => {
    const id = req.url.split("/")[2];
    let index = -1;
    let jokeToBeUpdated = db.find((item) => {
        index++;
        return item.id === +id;
    });

    if (!jokeToBeUpdated) {
        res.statusCode = 400;
        res.end(
            JSON.stringify({
                status: "error",
                message: `Joke with id: ${id} does not exits`,
            })
        );
        return;
    }

    let body = [];
    let userUpdate;
    req.on("data", (chunk) => {
        body.push(chunk);
    });
    req.on("end", () => {
        if (body.concat().toString() === "") {
            res.statusCode = 400;
            res.end(
                JSON.stringify({
                    status: "error",
                    message: "Please provide a body for the request.",
                })
            );
            return;
        }
        userUpdate = JSON.parse(body.concat().toString());
        jokeToBeUpdated = {
            ...jokeToBeUpdated,
            ...userUpdate,
        };

        // update the db
        db.splice(index, 1, jokeToBeUpdated);
        res.statusCode = 200;
        res.end(
            JSON.stringify({
                status: "success",
                updatedJoke: jokeToBeUpdated,
            })
        );
    });
};

const deleteRequestHandler = (req, res) => {
    const id = +req.url.split("/")[2];
    let index = -1;
    let jokeToBeDeleted = db.find((item) => {
        index++;
        return item.id === +id;
    });

    if (!jokeToBeDeleted) {
        res.statusCode = 400;
        res.end(
            JSON.stringify({
                status: "error",
                message: `Joke with id: ${id} does not exits`,
            })
        );
        return;
    }
    // remove joke from db
    db.splice(index, 1);
    res.end(
        JSON.stringify({
            status: "success",
            deletedJoke: jokeToBeDeleted,
        })
    );
};

const notFoundHandler = (req, res) => {
    res.statusCode = 400;
    res.end(
        JSON.stringify({
            status: "error",
            message: `${req.method} request to ${req.url} is not allowed.`,
        })
    );
};

const requestHandler = (req, res) => {
    if (req.method === "GET" && req.url === "/") {
        getRequestHandler(req, res);
    } else if (req.method === "POST" && req.url === "/") {
        postRequestHandler(req, res);
    } else if (req.method === "PATCH" && req.url.startsWith("/jokes/")) {
        patchRequestHandler(req, res);
    } else if (req.method === "DELETE" && req.url.startsWith("/jokes/")) {
        deleteRequestHandler(req, res);
    } else {
        notFoundHandler(req, res);
    }
};

const server = createServer(requestHandler);

server.listen(8989, () =>
    console.log(`Server is running on http://localhost:8989`)
);
