set -e

echo "Create user $DB_USER"

mongo <<EOF
db.createUser(
    {
        user: "$DB_USER",
        pwd: "$DB_PASSWORD",
        roles: [
            {
                role: "readWrite",
                db: "renkbench"
            }
        ]
    }
);