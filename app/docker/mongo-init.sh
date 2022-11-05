set -e

echo "Create user $DB_USER and database renkbench"

mongo <<EOF
use admin

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