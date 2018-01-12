module.exports = {
  dateString () {
    let now = new Date()
    let Y = now.getFullYear()
    let M = now.getMonth() + 1
    let d = now.getDate()
    return Y + (M < 10 ? '0' : '') + M) + d
  }
}