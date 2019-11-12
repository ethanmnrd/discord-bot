function test(){
    console.log('saying hello');
    global.hello();
    console.log(global.variable);
}

module.exports = {
  name: "test",
  description: "Views bot settings",
  args: false,
  serverOnly: false,
  execute(msg) {
    test();
  }
};