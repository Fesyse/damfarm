let s = {
  carrots: 0,
  potatoes: 0,
  wheat: 0,
  corn: 0,
};
let name = "potatoes";
let value = 1;

let z = {
  ...s,
  [name]: value,
};

console.log(z);
