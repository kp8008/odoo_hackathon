function search() {
  const query = document.getElementById("search").value.toLowerCase();
  fetch("http://localhost:5000/api/users")
    .then(res => res.json())
    .then(users => {
      const result = users.filter(u => u.skillsOffered.some(s => s.toLowerCase().includes(query)));
      document.getElementById("results").innerHTML = result.map(u =>
        `<div><h3>${u.name}</h3><p>${u.skillsOffered.join(', ')}</p></div>`
      ).join("");
    });
}
