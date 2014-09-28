---
title: Streaming archives
author: arlimus
date: 2014-09-28
template: article.jade
---

You have files on a system which you want to offer as an archive to download. Easy: There's great libraries in virtually all languages to create archives like `zip` or `tar` on the fly and stream back the files.

But how about adding files to an archive on the fly? Or combining archive streams? This greatly depends on the type you use.

<span class="more"></span>

## Archive types

Theory time: There's a great difference between compression and archive formats. Archives are file types, that allow you to combine a number of separate files into just one file. A user can then choose to extract the embedded files from this archive. Great examples for archives without embedded compression are `tar`, `iso`, and `cpio`.

Standalone compression types are used turn a large file or stream into a smaller one. Notice that I didn't use the plural: It only works for one file or stream at a time. Clear compression formats without archive functionality are e.g. `gzip`, `bzip2`, and `lzma`.

So if you see something like a `file.tar.gz`, you get a `gzip`-compressed `tar`-archive. The compression is applied to just one file: the `tar`-archive, which in turn contains all other files.

Some formats combine both archive and compression functionality. A great example is `zip`, which you can use with or without compression.

## Stream manipulation

Basically we are left with two archive formats which have streamlined support in all major languages: `zip` and `tar`. Here's where the fun starts.

Imagine you want to offer an API endpoint, which forwards a large file stream to a client and adds one additional file. Let's say you have an endpoint which receives and large binary file from somewhere else and forwards it to a client with some added added files in a large archive. You could of course always save the binary blob first and then create an archive on the fly. But if 100 clients request this simultaneously, you will have to optimize this process or suffer from too little hard disk space to serve all clients.

A better way is to forward the binary stream and embed it inside an archive which you stream back to the client. You can add your files to this archive first and then stream everything without ever having to save it to disk.

## Tar

Let's take a look at using `tar` first (example in Go):

```go
writer := tar.NewWriter(f)

header := &tar.Header{
  Name: "test.bin",
  Size: int64(len(data)),
}
if err := writer.WriteHeader(header); err != nil {
  log.Fatalln(err)
}
if _, err := writer.Write([]byte(data)); err != nil {
  log.Fatalln(err)
}
```

If we wanted to use `tar` archives for this, we quickly run into a major issue: In order to add files to such an archive, you first have to know the exact size of the data you want to add. This is required in every `tar` [file header](http://en.wikipedia.org/wiki/Tar_%28computing%29). When streaming binary data from an endpoint, you often don't get this information beforehand. You would have to wait for the full file to download and save it to disk before adding it. Not ideal at all.

## Zip

Using `zip` is just as simple (example in Go):

```go
writer := zip.NewWriter(f)

meta, err := zw.CreateHeader(&zip.FileHeader{
  Name:   "test.bin"
})
if err != nil {
  log.Fatalln(err)
}

if err := zw.Close(); err != nil {
  log.Fatalln(err)
}
```

Unlike `tar`, `zip` works well with streaming data due to its structure. You can add binary blobs or streams to the archive without knowing its accurate size, as seen in the example. In case of `zip`, the [central directory](http://en.wikipedia.org/wiki/File:ZIP-64_Internal_Layout.svg) is written at the end of the file. This way you can add files via streams without saving them first.

## Considerations

In case of streaming archives for export, `zip` has a nice advantage over `tar`. This turns around when considering import. Here, you have to save a complete `zip` file first, before being able to extract its data, because the central directory is located at the very end of the archive.

Here, `tar` has a nice advantage since you can receive a stream and extract files directly from the stream. For example, you could save a small file at your endpoint and forward/stream a large binary blob to a different receiver. All of this is possible without ever having to save the file on your system.

As you can see, there is no optimal solution which solves both problems. It all comes down to the use-case you want to support: If you offer an endpoint which may be used by many clients simultaneously for export but only ever supports one connection for import, you might be better off with `zip`. For the other use-case (simultaneous large uploads), `tar` might be a better solution. Don't worry too much about compression, as you can add `gzip` or `lzma` on top of both formats.

In the end, all of this is only relevant when manipulating archive streams on the fly.
