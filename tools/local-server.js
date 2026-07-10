const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");

const host = "0.0.0.0";
const port = Number(process.env.PORT || 8080);
const root = path.resolve(__dirname, "..");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg"
};

const server = http.createServer((request, response) => {
  const urlPath = decodeURIComponent(request.url.split("?")[0]);
  const requestedPath = urlPath === "/" ? "index.html" : urlPath.slice(1);
  const filePath = path.resolve(root, requestedPath);

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-cache"
    });
    response.end(data);
  });
});

function localNetworkUrls() {
  const virtualWords = ["virtual", "vethernet", "vmware", "virtualbox", "docker", "bluetooth"];

  return Object.entries(os.networkInterfaces())
    .flatMap(([name, networks]) => (
      networks
        .filter((network) => (
          network
          && network.family === "IPv4"
          && !network.internal
        ))
        .map((network) => ({
          name,
          url: `http://${network.address}:${port}/`,
          isVirtual: virtualWords.some((word) => name.toLowerCase().includes(word))
        }))
    ))
    .sort((a, b) => Number(a.isVirtual) - Number(b.isVirtual));
}

server.listen(port, host, () => {
  console.log("");
  console.log("収穫量管理アプリを起動しました。");
  console.log("");
  console.log("PCで開くURL:");
  console.log(`  http://localhost:${port}/`);
  console.log("");
  console.log("スマホで開くURL候補:");
  const urls = localNetworkUrls();
  if (urls.length) {
    urls.forEach((item) => {
      const note = item.isVirtual ? "  ※仮想ネットワークの可能性あり" : "";
      console.log(`  ${item.url}  (${item.name})${note}`);
    });
  } else {
    console.log("  Wi-FiのIPv4アドレスを取得できませんでした。");
  }
  console.log("");
  console.log("スマホとPCを同じWi-Fiにつなぎ、上のURLをスマホのブラウザで開いてください。");
  console.log("終了するときは、この画面で Ctrl + C を押してください。");
  console.log("");
});

server.on("error", (error) => {
  console.error("");
  console.error("サーバーを起動できませんでした。");
  if (error.code === "EADDRINUSE") {
    console.error(`ポート ${port} はすでに使用されています。別の起動中サーバーを閉じるか、PORTを変えてください。`);
  } else {
    console.error(error.message);
  }
  process.exitCode = 1;
});
