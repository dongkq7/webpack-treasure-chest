// import("./sum.js").then();
if (Math.random() < 0.5) {
  import("./a.js").then((module) => {
    console.log(module.sum(1, 2));
  });
}
