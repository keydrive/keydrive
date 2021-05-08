package logger

import (
	"fmt"
	"io"
	"os"
	"strings"
	"sync"
	"time"
)

type Level byte

const (
	LevelDebug Level = iota
	LevelInfo
	LevelWarn
	LevelError
)

func (l Level) String() string {
	switch l {
	case LevelDebug:
		return "DEBUG"
	case LevelInfo:
		return "INFO "
	case LevelWarn:
		return "WARN "
	case LevelError:
		return "ERROR"
	default:
		return "UNKWN"
	}
}

var largestPrefix = 0
var prefixLock = sync.Mutex{}

type Logger struct {
	prefix string
	debug  io.Writer
	info   io.Writer
	warn   io.Writer
	error  io.Writer
}

func NewConsole(level Level, prefix string) *Logger {
	result := &Logger{
		prefix: prefix,
		debug:  nil,
		info:   nil,
		warn:   nil,
		error:  nil,
	}
	prefixLock.Lock()
	if len(prefix) > largestPrefix {
		largestPrefix = len(prefix)
	}
	prefixLock.Unlock()
	if level <= LevelDebug {
		result.debug = os.Stdout
	}
	if level <= LevelInfo {
		result.info = os.Stdout
	}
	if level <= LevelWarn {
		result.warn = os.Stderr
	}
	if level <= LevelError {
		result.error = os.Stderr
	}
	return result
}

func (l *Logger) log(level Level, writer io.Writer, message string, params ...interface{}) {
	if writer == nil {
		return
	}

	payload := fmt.Sprintf(message, params...)
	line := fmt.Sprintf("%s [%s] - [%s%s]: %s\n", time.Now().Format(time.Stamp), level, strings.Repeat(" ", largestPrefix-len(l.prefix)), l.prefix, payload)
	_, _ = writer.Write([]byte(line))
}

func (l *Logger) Debug(message string, params ...interface{}) {
	l.log(LevelDebug, l.debug, message, params...)
}

func (l *Logger) Info(message string, params ...interface{}) {
	l.log(LevelInfo, l.info, message, params...)
}

func (l *Logger) Warn(message string, params ...interface{}) {
	l.log(LevelWarn, l.warn, message, params...)
}

func (l *Logger) Error(message string, params ...interface{}) {
	l.log(LevelError, l.error, message, params...)
}
