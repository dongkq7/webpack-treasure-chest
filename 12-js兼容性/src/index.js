const a = 1

class Person {
  static a = 1
  constructor(name) {
    this.name = name
  }
}

const p = new Person('jack')
console.log(p.name)

async function test() {
  return 'test'
}

test().then(res => {  
  console.log(res)
})


const arr = [11, 24, 13, 74, 55];

console.log(arr.find((x) => x % 2 === 0));
console.log(arr.findIndex((x) => x % 2 === 0));


function Print() {
  console.log(this.loginId);
}

// const obj = {
//   loginId: "abc"
// };

// obj::Print(); //相当于：Print.call(obj);

const obj = {
  foo: {
    bar: {
      baz: 42,
    },
  },
};

const baz = obj?.foo?.bar?.baz; // 42

const safe = obj?.qux?.baz; // undefined
