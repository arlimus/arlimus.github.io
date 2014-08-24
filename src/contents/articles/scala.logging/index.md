---
title: Scala and Logstash
author: arlimus
date: 2014-08-24
template: article.jade
---

Getting your application to write log info is easy. Just grab a small logging framework that writes to stdout or a logfile. They are available in all major languages, well-document, and easy to get going.

During the last years, logstash and friends have taken root in our environments and made our lives much easier. 

With this in mind, I though it must be simple enough to get my scala applications equipped with some nice log-stashing. Here's where I landed.

<span class="more"></span>

## Logstash

First things first. You can run your log-stashing experiments against a central or remote logstash server, OR you can just quickly spin up a tiny logstash to get going locally. Here's how:

```bash
curl -O https://download.elasticsearch.org/logstash/logstash/logstash-1.4.2.tar.gz
tar xf logstash-1.4.2.tar.gz
cd logstash-1.4.2
```

Ìf you want to see how it looks like with good input:

```bash
bin/logstash -e 'input { stdin { } } output { stdout { codec => json } }'
```

Now type anything and hit return. It will respond with a JSON object (which is an easy way to see what logstash expects as valid input).

Now, let's say you want to test your application against the default logstash tcp endpoint and see whether it works. Set it up locally:

```bash
bin/logstash -e 'input { tcp { port => 9998 } } output { stdout { codec => json } }'
```

Once everything is working, you can use it as a forwarder to your upstream elasticsearch like this:

```bash
bin/logstash -e 'input { tcp { port => 9998 } } output { stdout { codec => json } elasticsearch_http { host => "es.domain.com" port => 12345 } }'
```


## Logback

Searching for Scala logging I came across [scala-logging](https://github.com/typesafehub/scala-logging). It works on top of [SLF4J](http://www.slf4j.org/) backends. Knowing [Log4J](http://logging.apache.org/log4j), I headed off to mix [logback](logback.qos.ch) into this framework cocktail.

It's simple enough to get going: Add a few dependencies to your `build.sbt`

```scala
libraryDependencies += "ch.qos.logback" % "logback-classic" % "1.1.2"

libraryDependencies += "com.typesafe.scala-logging" %% "scala-logging" % "3.1.0"

libraryDependencies += "net.logstash.logback" % "logstash-logback-encoder" % "3.0"
```

Then add a log object:

```scala
import com.typesafe.scalalogging.Logger
import org.slf4j.LoggerFactory

val Log = Logger(LoggerFactory.getLogger("pdfmangler"))
Log.info("Hello World")
```

Finally, add a configuration file in `src/main/resources/logback.xml`:

```xml
<configuration>
    <appender name="LOGSTASH" class="net.logstash.logback.appender.LogstashTcpSocketAppender">
        <remoteHost>HOST</remoteHost>
        <port>9998</port>
    </appender>

    <root level="DEBUG">
        <appender-ref ref="LOGSTASH" />
    </root>
</configuration>
```

Simple.

Or so I though. 

Running this against my local logstash, I soon realized that it doesn't seem to work with the current release. It will eventually get updated, but there are a few alternatives you can use. 

One of them is to take the simple route via syslog. Add it to your `logback.xml` (moved to port 11514 for local testing as non-root):

```xml
<configuration>
    <appender name="SYSLOG" class="ch.qos.logback.classic.net.SyslogAppender">
        <syslogHost>localhost</syslogHost>
        <port>11514</port>
        <facility>AUTH</facility>
        <suffixPattern>[%thread] %logger %msg</suffixPattern>
    </appender>

    <root level="DEBUG">
        <appender-ref ref="LOGSTASH" />
    </root>
</configuration>
```

Start your testing server and see it fly:

```bash
bin/logstash -e 'input { syslog { port => 11514 } } output { stdout { codec => json } }'
```

Let's add one tricky aspect: You don't want to run syslog on UDP, but TCP instead. "There must be a parameter for that..." Unfortunately there isn't. Unless you're creating your own method or switch to Log4J2 (see below), there is no easy way to get this in logback.

But there are a few simple workarounds. One if [logstash-forwarder](https://github.com/elasticsearch/logstash-forwarder) which uses lumberjack (which supports and requires SSL key-management). Another simple alternative (but more cost-intensive), is to start a local logstash forwarder yourself:

```bash
bin/logstash -e 'input { syslog { port => 11514 } } output { elasticsearch_http { host => "syslog.domain.com" port => 514 } }'
```


## Log4J2

Curiously, logback isn't the only successor of Log4J. The initial version has now reached a "#2 version stamp", which has been remodeled and offers a new API. Let's try that: Add a few dependencies:

```scala
libraryDependencies += "org.apache.logging.log4j" % "log4j-core" % "2.0.1"

libraryDependencies += "org.apache.logging.log4j" % "log4j-api" % "2.0.1"

libraryDependencies += "com.fasterxml.jackson.core" % "jackson-core" % "2.4.2"

libraryDependencies += "com.fasterxml.jackson.core" % "jackson-databind" % "2.4.2"

libraryDependencies += "com.fasterxml.jackson.core" % "jackson-annotations" % "2.4.2"
```

Replace the usage lines

```scala
import org.apache.logging.log4j.LogManager

val Log = LogManager.getLogger(this.getClass.getName)
Log.info("Hello World")
```

And add a new configuration file to `src/main/resources/log4j2.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="DEBUG" packages="net.logstash.logging.log4j2.core.layout">
    <Appenders>
        <Socket name="LogStashSocket" host="logstash.domain.com" port="9998" protocol="tcp">
            <LogStashJSONLayout>
            </LogStashJSONLayout>       
        </Socket>
    </Appenders>
    <Loggers>
        <Root level="debug">
            <AppenderRef ref="LogStashSocket"/>
        </Root>
    </Loggers>
</Configuration>
```

That should work. But at the time of this writing, it too showed a few flaws. The same workaround as above applies.


## Summary

I can't add a summary without a fat disclaimer: Most of the JARs used here are still a bit new and Logstash has experienced a few API updates recently. Older versions may work perfectly, but I unfortunately don't have the time to find a perfect match. For the time being, a workaround will do.

I found both logging frameworks equally enjoyable, although Log4J2 has a slight edge here thanks to its modularity. Performance considerations are not covered yet, but will be added in the future. Until then, enjoy your Scala log-stashing