HERRAMIENTAS_DATABASE =
  "https://gist.githubusercontent.com/Hernan4444/a61e71b1ce1befeda0d005500bb42b51/raw/225fc163ae07a92f776bca88bc4541d799e0069b/herramientas.json";
TUPLAS_DATABASE =
  "https://gist.githubusercontent.com/Hernan4444/a61e71b1ce1befeda0d005500bb42b51/raw/225fc163ae07a92f776bca88bc4541d799e0069b/herramientas_en_comun.csv";

const WIDTH = 800;
const HEIGHT = 600;

const svg = d3.select("#vis").attr("width", WIDTH).attr("height", HEIGHT);

// COMPLETAR CON CÓDIGO JS y D3.JS NECESARIO

const MARGIN = {
  top: 70,
  bottom: 70,
  right: 10,
  left: 50,
};

const COLORS = ["#8dd3c7", "#ffffb3", "#8d86da", "#fb8073"];

const HEIGHTVIS = HEIGHT - MARGIN.top - MARGIN.bottom;
const WIDTHVIS = WIDTH - MARGIN.right - MARGIN.left;

const contenedor = svg
  .append("g")
  .attr("transform", `translate(${MARGIN.left} ${MARGIN.top})`);

function joinDeHerramientas(datos) {
  // sumarle 5_000 a cada uno nos permite tener un gráfico que no se vea tan apretado (agrega una separación a ejes)
  const maximaTrabajan = d3.max(datos, (d) => d.trabajando) + 5_000;
  const maximaDesean = d3.max(datos, (d) => d.desean) + 5_000;

  // encontrar todas las categorías únicas
  const set = new Set(datos.map((d) => d.categoria));
  // transformar el set de categorías en un array
  const categorias = Array.from(set);

  // crear escalas X, Y
  const escalaX = d3
    .scaleLinear()
    .domain([0, maximaDesean])
    .range([0, WIDTHVIS]);

  const escalaY = d3
    .scaleLinear()
    .domain([0, maximaTrabajan])
    .range([HEIGHTVIS, 0]);

  // Fuente para lineas de grilla: https://stackoverflow.com/questions/68475907/grid-lines-in-d3-js-dont-match-the-axes
  const ejeX = d3.axisBottom(escalaX).tickSize(-HEIGHTVIS).tickPadding(10);
  const ejeY = d3.axisLeft(escalaY).tickSize(-WIDTHVIS);

  // agregar eje X
  svg
    .append("g")
    .attr("transform", `translate(${MARGIN.left}, ${HEIGHTVIS + MARGIN.top})`)
    .attr("class", "grid")
    .style("stroke-dasharray", "5 5")
    .call(ejeX);

  // agregar eje Y
  svg
    .append("g")
    .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`)
    .attr("class", "grid")
    .style("stroke-dasharray", "5 5")
    .call(ejeY);

  // Texto eje X
  svg
    .append("text")
    .style("font-size", "14px")
    .attr("x", WIDTH - MARGIN.right)
    .attr("y", HEIGHT - 20)
    .attr("text-anchor", "end")
    .text("Personas que desean utilizar esta herramienta");

  // Texto eje Y
  svg
    .append("text")
    .attr("font-size", "14px")
    .attr("x", 10)
    .attr("y", 40)
    .attr("text-anchor", "start")
    .text("Personas que utilizan actualmente esta herramienta");

  // agegar cículo por cada dato

  // tooltip para mostrar nombre de tecnología
  cajaRect = contenedor
    .append("rect")
    .attr("x", -100)
    .attr("y", -100)
    .attr("width", 100)
    .attr("height", 25)
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("stroke-width", 2);
  cajaText = contenedor
    .append("text")
    .text("Herramientas")
    .attr("x", -100)
    .attr("y", -100)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .attr("style", "background-color: red;");

  // llamado al hacer hover sobre un círculo
  function mouseoverCaja(e, d) {
    const circle = d3.select(e.currentTarget);
    circle.transition().duration(100).attr("r", 15);

    cajaText.text(d.name);
    const x = circle.attr("cx");
    const y = circle.attr("cy");
    cajaText.attr("x", x);
    cajaText.attr("y", y - 30);

    // Fuente: https://gist.github.com/nitaku/8745933/8660a5f46547c04afc2362788910773c56c16642
    const bbox = cajaText.node().getBBox();
    const textWidth = bbox.width;
    const textHeight = bbox.height;
    const textX = bbox.x;
    const textY = bbox.y;
    console.log(textWidth, textHeight);
    cajaRect.attr("x", textX - 5);
    cajaRect.attr("y", textY - 5);
    cajaRect.attr("width", textWidth + 10);
    cajaRect.attr("height", textHeight + 10);

    cajaRect.raise();
    cajaText.raise();
  }

  contenedor
    .selectAll("circle")
    .data(datos)
    .join("circle")
    .attr("id", (d) => "circle" + d.id)
    .attr("cx", (d) => escalaX(d.desean))
    .attr("cy", (d) => escalaY(d.trabajando))
    .attr("r", 8)
    .attr("stroke", "black")
    .attr("fill", (d) => COLORS[categorias.indexOf(d.categoria)])
    // create a tooltip para hover del círculo
    // Fuente: https://jonathansoma.com/tutorials/d3/clicking-and-hovering/
    .on("mouseover", (e, d) => mouseoverCaja(e, d))
    .on("mouseout", function (e, d) {
      // para no borrar el tooltip, simplemente lo movemos fuera de la pantalla
      cajaText.attr("x", -100).attr("y", -100);
      cajaRect.attr("x", -100).attr("y", -100);
      d3.select(e.currentTarget).transition().duration(100).attr("r", 8);
    });

  // leyenda
  const leyenda = contenedor.append("g").attr("id", "leyenda");
  leyenda
    .selectAll("circle")
    .data(categorias)
    .join("circle")
    .attr("cx", 200)
    .attr("cy", (_, i) => 130 + i * 30)
    .attr("r", 6)
    .style("fill", (_, i) => COLORS[i]);

  leyenda
    .selectAll("text")
    .data(categorias)
    .join("text")
    .text((d) => d)
    .attr("font-size", "15px")
    .attr("x", 220)
    .attr("y", (_, i) => 130 + i * 30 + 5);

  // move leyenda to bottom left corner
  leyenda.attr("transform", `translate(${WIDTHVIS - 350}, ${HEIGHTVIS - 280})`);
  contenedor.raise();
  leyenda.raise();
}

function joinDeTuplas(datos) {
  datos = datos.map((d) => {
    return { ...d, usuarios_en_comun: Number(d.usuarios_en_comun) };
  });
  const maximaConexion = d3.max(datos, (d) => d.usuarios_en_comun);

  const escalaAncho = d3
    .scaleLinear()
    .domain([0, maximaConexion])
    .range([1, 10]);

  contenedor
    .selectAll("line")
    .data(datos)
    .join("line")
    .attr("x1", (d) => {
      return d3.select(`#circle${d.nodo_1}`).attr("cx");
    })
    .attr("y1", (d) => {
      return d3.select(`#circle${d.nodo_1}`).attr("cy");
    })
    .attr("x2", (d) => {
      return d3.select(`#circle${d.nodo_2}`).attr("cx");
    })
    .attr("y2", (d) => {
      return d3.select(`#circle${d.nodo_2}`).attr("cy");
    })
    .attr("stroke", "gray")
    .attr("stroke-opacity", 0.5)
    .attr("stroke-width", (d) => {
      return escalaAncho(d.usuarios_en_comun);
    });

  contenedor.selectAll("circle").raise();
}

const herramientas = d3
  .json(HERRAMIENTAS_DATABASE)
  .then((d) => {
    console.log("Herramientas cargadas");
    joinDeHerramientas(d);
  })
  .catch((error) => {
    console.log("Error al cargar las herramientas", error);
  });

const tuplas = d3
  .csv(TUPLAS_DATABASE)
  .then((d) => {
    joinDeTuplas(d);
    console.log("Tuplas cargadas");
  })
  .catch((error) => {
    console.log("Error al cargar las tuplas", error);
  });
