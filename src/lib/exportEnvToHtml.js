const fs = require('fs');

module.exports = () => {
  const script = fs.readFileSync('public/script.js').toString();
  const updateScript = `
  window.onload = function () {
	const HOST = "${process.env.HOST}"; \n ${script}
	}; 
 `;

  fs.writeFileSync('public/index.js', updateScript);
};
