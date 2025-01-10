const colors = ["#f26395", "#62efab", "#ef7658", "#ffe868", "#80e3f7", "#d781f9"]

export function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}
export default function() {
  console.log(getRandomNumber(0, 6))
  return colors[getRandomNumber(0, 6)]
}