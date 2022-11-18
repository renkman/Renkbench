// connection
package mongodb

import (
	"time"
)

type Connection struct {
	Uri     string
	Timeout time.Duration
}
