let currentGraphElements = [];
let currentAdjList = {};

let cy;

// let num = document.getElementById('size').value == 'small' ? 6 : 10;

function generateRandomGraph(nodeCount, edgeCount, graphType, cycleType) {
    let elements = [];

    for (let i = 0; i < nodeCount; i++) {
        elements.push({
            data: {
                id: `${i}`
            }
        });
    }

    let edgeSet = new Set();

    if (
        graphType === 'undirected' &&
        cycleType === 'acyclic'
    ) {

        edgeCount = nodeCount - 1;

    }

    while (edgeSet.size < edgeCount) {
        let source = Math.floor(Math.random() * nodeCount);
        let target = Math.floor(Math.random() * nodeCount);

        if (cycleType === 'acyclic') {

            if (graphType === 'directed') {

                // Force DAG direction
                if (source > target) {

                    [source, target] = [target, source];

                }

            }

        }

        if (source === target) continue;

        let edgeKey;

        if (graphType === 'undirected') {
            edgeKey = source < target ? `${source}-${target}` : `${target}-${source}`;
        }
        else {
            edgeKey = `${source}-${target}`;
        }

        if (edgeSet.has(edgeKey)) continue;

        edgeSet.add(edgeKey);

        let weight = Math.floor(Math.random() * 9) + 1;

        elements.push({
            data: {
                id: `e${source}${target}`,
                source: `${source}`,
                target: `${target}`,
                weight: weight
            }
        });
    }

    return elements;
}

function renderGraph() {
    if (cy) {
        cy.destroy();
    }

    let graphType = document.getElementById('dir_undir').value;
    let cycleType = document.getElementById('cycles').value;
    let num = document.getElementById('size').value == 'small' ? 6 : 10;

    currentGraphElements = generateRandomGraph(num, num + 2, graphType, cycleType);

    cy = cytoscape({
        container: document.getElementById('graph'),

        elements: currentGraphElements,

        style: [
            {
                selector: 'node',
                style: {
                    'background-color': 'lightskyblue',
                    'label': 'data(id)',
                    'text-valign': 'center',
                    'color': 'black',
                    'font-size': '16px'


                }
            },

            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': graphType === 'directed' ? 'triangle' : 'none',
                    'curve-style': 'bezier',

                    'label': 'data(weight)',
                    'font-size': '14px',
                    'color': 'white',
                    'text-background-color': 'black',
                    'text-background-opacity': 1,
                    'text-background-padding': '2px',
                }
            }
        ],

        layout: {
            name: 'cose'
        }
    });

    currentAdjList = generateAdjacencyList(graphType);

    renderAdjacencyList(graphType);
}

function generateAdjacencyList(graphType) {
    let adj = {};

    currentGraphElements.forEach(element => {
        if (!element.data.source) {
            adj[element.data.id] = [];
        }
    });

    currentGraphElements.forEach(element => {
        if (element.data.source) {
            let u = element.data.source;
            let v = element.data.target;

            adj[u].push({
                node: v,
                weight: element.data.weight
            });

            if (graphType === 'undirected') {
                adj[v].push({
                    node:u,
                    weight:element.data.weight
                });
            }
        }
    });

    return adj;
}

function renderAdjacencyList(graphType) {
    let adj = generateAdjacencyList(graphType);

    let listDiv = document.querySelector('.list');

    let html = '';

    for (let node in adj) {
        let neighbours = adj[node]
            .map(nei => `(${nei.node}, ${nei.weight})`)
            .join(' , ');

        html += `
        ${node} : {${neighbours}}
        <br><br>
    `;
    }

    listDiv.innerHTML = html;
}

function resetVisualisation() {

    // Reset queue
    document.querySelector('.Queue').innerHTML = '';

    // Reset result
    document.querySelector('.resarr').innerHTML = '';

    // Reset visited array
    for (let i = 0; i < 10; i++) {

        document.querySelector(`.vis${i}`).innerHTML = '0';

    }

    // Reset node colors
    cy.nodes().style(
        'background-color',
        'lightskyblue'
    );

    // Reset edge colors
    cy.edges().style({
        'line-color': '#ccc',
        'target-arrow-color': '#ccc'
    });
}

async function bfs() {
    resetVisualisation();

    let startNode = Number(document.querySelector('input').value);

    if (
        isNaN(startNode) ||
        !(startNode in currentAdjList)
    ) {
        alert('Enter valid start node');
        return;
    }

    let visited = {};

    let result = [];

    async function bfsTraversal(source) {

        let queue = [];

        queue.push(source);

        visited[source] = true;

        document.querySelector(`.vis${source}`)
            .innerHTML = '1';

        renderQueue(queue);

        while (queue.length > 0) {

            // SHOW CURRENT QUEUE
            renderQueue(queue);

            await sleep(getSpeed());

            // FRONT ELEMENT
            let node = queue[0];

            // DEQUEUE ANIMATION
            await dequeueAnimation();

            // ACTUAL POP
            queue.shift();

            renderQueue(queue);

            // PROCESS NODE
            cy.getElementById(node).style(
                'background-color',
                'orange'
            );

            result.push(node);

            renderResult(result);

            await sleep(getSpeed());

            cy.getElementById(node).style(
                'background-color',
                'green'
            );

            // ENQUEUE NEIGHBOURS
            for (let neighbourObj of currentAdjList[node]) {

                let neighbour = neighbourObj.node;

                if (!visited[neighbour]) {

                    visited[neighbour] = true;

                    document.querySelector(`.vis${neighbour}`)
                        .innerHTML = '1';

                    queue.push(neighbour);

                    renderQueue(queue);

                    await sleep(300);
                }
            }
        }

        // let queue = [];

        // queue.push(source);

        // visited[source] = true;

        // document.querySelector(`.vis${source}`)
        //     .innerHTML = '1';

        // while (queue.length > 0) {

        //     let node = queue.shift();

        //     renderQueue(queue);

        //     cy.getElementById(node).style(
        //         'background-color',
        //         'orange'
        //     );

        //     await sleep(getSpeed());

        //     result.push(node);

        //     renderResult(result);

        //     cy.getElementById(node).style(
        //         'background-color',
        //         'green'
        //     );

        //     for (let neighbour of currentAdjList[node]) {

        //         if (!visited[neighbour]) {

        //             visited[neighbour] = true;

        //             document.querySelector(`.vis${neighbour}`)
        //                 .innerHTML = '1';

        //             queue.push(neighbour);

        //             renderQueue(queue);
        //         }
        //     }
        // }
    }

    // Start BFS from entered node
    await bfsTraversal(startNode);

    // Traverse remaining components
    for (let node in currentAdjList) {

        if (!visited[node]) {

            await bfsTraversal(node);

        }
    }
}

async function dequeueAnimation() {

    let qdiv = document.querySelector('.Queue');

    let bottomNode = qdiv.lastElementChild;

    if (bottomNode) {

        bottomNode.classList.add('dequeue');

        await sleep(300);
    }
}

function sleep(ms) {
    return new Promise(resolve =>
        setTimeout(resolve, ms)
    );
}

function renderQueue(queue) {
    // let qdiv = document.querySelector('.Queue');

    // qdiv.innerHTML = '';

    // queue.forEach(element => {
    //     let nodeDiv = document.createElement('div');
    //     nodeDiv.classList.add('queueNode');

    //     nodeDiv.innerHTML = element;

    //     qdiv.appendChild(nodeDiv);
    // });

    let qdiv = document.querySelector('.Queue');

    qdiv.innerHTML = '';

    [...queue].reverse().forEach(element => {

        let nodeDiv = document.createElement('div');

        nodeDiv.classList.add('queueNode');

        nodeDiv.innerHTML = element;

        qdiv.appendChild(nodeDiv);
    });
}

async function dfs() {
    resetVisualisation();

    let startNode = Number(document.querySelector('input').value);

    let visited = {};

    let result = [];

    async function dfsTraversal(node) {
        visited[node] = true;

        document.querySelector(`.vis${node}`).innerHTML = 1;

        cy.getElementById(node).style(
            'background-color', 'orange'
        );

        result.push(node);
        renderResult(result);

        await sleep(getSpeed());

        for (let neighbourObj of currentAdjList[node]) {
            let neighbour = neighbourObj.node;
            if (!visited[neighbour]) {
                // let edge = cy.edges().filter(edge => {

                //     let src = edge.data('source');
                //     let tgt = edge.data('target');

                //     return (
                //         (src == node && tgt == neighbour) ||
                //         (src == neighbour && tgt == node)
                //     );
                // });

                // edge.style({
                //     'line-color': 'orange',
                //     'target-arrow-color': 'orange'
                // });

                await dfsTraversal(neighbour);
            }
        }

        cy.getElementById(node).style(
            'background-color', 'green'
        );
    }

    await dfsTraversal(startNode);

    for (let node in currentAdjList) {
        if (!visited[node]) {
            await dfsTraversal(node);
        }
    }
}

function renderDistanceArray(dist) {
    for (let i = 0; i < 10; i++) {
        let cell = document.querySelector(`.vis${i}`);

        if (!cell) continue;

        if (dist[i] == Infinity) {
            cell.innerHTML = 'INF';
        }

        else if (dist[i] != undefined) {
            cell.innerHTML = dist[i];
        }

        else {
            cell.innerHTML = '-';
        }
    }
}

function renderPQueue(queue) {
    let qDiv = document.querySelector('.Queue');

    qDiv.innerHTML = '';

    [...queue].reverse().forEach(element => {

        let nodeDiv = document.createElement('div');

        nodeDiv.classList.add('queueNode');

        nodeDiv.innerHTML =
            `(${element.dist}, ${element.node})`;

        qDiv.appendChild(nodeDiv);
    });
}

async function dijkstras() {
    resetVisualisation();

    let startNode = Number(document.querySelector('input').value);

    if (
        isNaN(startNode) ||
        !(startNode in currentAdjList)
    ) {
        alert('Enter valid start node');
        return;
    }

    let n = Object.keys(currentAdjList).length;

    let dist = Array(n).fill(Infinity);

    let pq = [];

    let result = [];

    dist[startNode] = 0;

    pq.push(
        {
            node: startNode,
            dist: 0
        }
    );

    renderDistanceArray(dist);

    renderPQueue(pq);

    while (pq.length > 0) {
        pq.sort((a, b) => a.dist - b.dist);

        renderPQueue(pq);

        await sleep(getSpeed());

        let current = pq.shift();

        let node = current.node;

        let d = current.dist;

        renderPQueue(pq);

        if (d > dist[node]) continue;

        cy.getElementById(node).style(
            'background-color',
            'orange'
        );

        result.push(node);

        renderResult(result);

        await sleep(getSpeed());

        // TRAVERSE NEIGHBOURS
        for (let neighbourObj of currentAdjList[node]) {

            let neighbour = neighbourObj.node;

            let wt = neighbourObj.weight;

            // FIND EDGE
            let edge = cy.edges().filter(edge => {

                let src = edge.data('source');
                let tgt = edge.data('target');

                return (
                    (src == node && tgt == neighbour) ||
                    (src == neighbour && tgt == node)
                );
            });

            // EDGE HIGHLIGHT
            edge.style({
                'line-color': 'orange',
                'target-arrow-color': 'orange'
            });

            await sleep(300);

            // RELAXATION
            if (dist[node] + wt < dist[neighbour]) {

                dist[neighbour] =
                    dist[node] + wt;

                renderDistanceArray(dist);

                pq.push({
                    node: neighbour,
                    dist: dist[neighbour]
                });

                renderPQueue(pq);

                await sleep(getSpeed());
            }

            // RESET EDGE
            edge.style({
                'line-color': '#ccc',
                'target-arrow-color': '#ccc'
            });
        }

        // FINALIZE NODE
        cy.getElementById(node).style(
            'background-color',
            'green'
        );
    }
}

function renderResult(result) {

    document.querySelector('.resarr')
        .innerHTML = result.join(' ');

}

function getSpeed() {

    let speed = document.getElementById('speed').value;

    if (speed === 'slow') return 1000;

    if (speed === 'medium') return 500;

    return 200;
}

renderGraph();

document.getElementById('newGraphBtn').addEventListener(
    'click', () => {
        renderGraph();
        resetVisualisation();
    }
)

document.getElementById('dir_undir').addEventListener(
    'change', () => {

        renderGraph();
        resetVisualisation();

    });

document.getElementById('size').addEventListener(
    'change', () => {
        renderGraph();
        resetVisualisation();
    }
);

document.getElementById('cycles').addEventListener(
    'change', () => {
        renderGraph();
        resetVisualisation();
    }
);

document.getElementById('visualiseBtn').addEventListener(
    'click', () => {
        let algorithm = document.getElementById('algorithms').value;

        if (algorithm == 'bfs') {
            bfs();
        }

        else if (algorithm == 'dfs') {
            dfs();
        }

        else if (algorithm == 'dijkstras') {
            dijkstras();
        }
    }
);

document.getElementById('algorithms').addEventListener(
    'change', () => {
        let algorithm = document.getElementById('algorithms').value;

        let queueSection = document.querySelector('.queue');
        let queueName = document.querySelector('.qname');

        let visName = document.querySelector('.visname');

        if (algorithm === 'dfs') {

            queueSection.style.display = 'none';

        }

        else if (algorithm == 'dijkstras') {
            queueSection.style.display = 'flex';
            queueName.innerHTML = 'Priority Queue';
            visName.innerHTML = 'Distance Array :-';

            let indexes = document.querySelectorAll('.ind');
            indexes.forEach(index => {
                index.innerHTML = 'INF';
            })
        }
        else {

            queueSection.style.display = 'flex';
            queueName.innerHTML = 'Queue';
            visName.innerHTML = 'Visited Array :-';

        }

    }
);