// Data
const locations = [
  {id: 0, name: "Depot - Sabor Express", x: 3.75, y: 9.51, demand: 0},
  {id: 1, name: "Bairro 1", x: 7.32, y: 5.99, demand: 2},
  {id: 2, name: "Bairro 2", x: 1.56, y: 0.58, demand: 5},
  {id: 3, name: "Bairro 3", x: 6.01, y: 7.08, demand: 5},
  {id: 4, name: "Bairro 4", x: 9.70, y: 8.32, demand: 2},
  {id: 5, name: "Bairro 5", x: 1.82, y: 1.83, demand: 4},
  {id: 6, name: "Bairro 6", x: 6.12, y: 0.07, demand: 1},
  {id: 7, name: "Bairro 7", x: 2.91, y: 6.12, demand: 2},
  {id: 8, name: "Bairro 8", x: 0.47, y: 9.74, demand: 3},
  {id: 9, name: "Bairro 9", x: 3.82, y: 9.83, demand: 1},
  {id: 10, name: "Bairro 10", x: 4.75, y: 5.27, demand: 3},
  {id: 11, name: "Bairro 11", x: 5.37, y: 2.17, demand: 4},
  {id: 12, name: "Bairro 12", x: 7.82, y: 8.73, demand: 2},
  {id: 13, name: "Bairro 13", x: 2.74, y: 2.03, demand: 5},
  {id: 14, name: "Bairro 14", x: 3.25, y: 1.04, demand: 3},
  {id: 15, name: "Bairro 15", x: 4.67, y: 0.37, demand: 2},
  {id: 16, name: "Bairro 16", x: 1.87, y: 5.93, demand: 5},
  {id: 17, name: "Bairro 17", x: 2.99, y: 0.57, demand: 3},
  {id: 18, name: "Bairro 18", x: 2.25, y: 9.51, demand: 4},
  {id: 19, name: "Bairro 19", x: 4.81, y: 0.71, demand: 2},
  {id: 20, name: "Bairro 20", x: 8.86, y: 9.42, demand: 1}
];

const clusters = [
  {
    id: 0,
    name: "Zona 1",
    color: "#2196F3",
    points: [7, 8, 9, 10, 16, 18],
    centroid: {x: 2.02, y: 8.02},
    route: [0, 9, 18, 8, 10, 16, 7, 0],
    distance: 13.63,
    stops: 6,
    demand: 15,
    time: 57
  },
  {
    id: 1,
    name: "Zona 2",
    color: "#4CAF50",
    points: [2, 5, 6, 11, 13, 14, 15, 17, 19],
    centroid: {x: 3.96, y: 1.54},
    route: [0, 19, 17, 14, 11, 13, 2, 5, 15, 6, 0],
    distance: 31.91,
    stops: 9,
    demand: 29,
    time: 109
  },
  {
    id: 2,
    name: "Zona 3",
    color: "#F44336",
    points: [1, 3, 4, 12, 20],
    centroid: {x: 7.73, y: 7.74},
    route: [0, 20, 3, 1, 12, 4, 0],
    distance: 15.54,
    stops: 5,
    demand: 14,
    time: 56
  }
];

let currentZone = 0;

// Utility Functions
function euclideanDistance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function buildDistanceMatrix() {
  const matrix = {};
  for (let i = 0; i < locations.length; i++) {
    matrix[i] = {};
    for (let j = 0; j < locations.length; j++) {
      if (i !== j) {
        matrix[i][j] = euclideanDistance(locations[i], locations[j]);
      }
    }
  }
  return matrix;
}

const distanceMatrix = buildDistanceMatrix();

// Navigation
function navigateTo(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  document.getElementById(sectionId).classList.add('active');
  const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
  
  // Trigger rendering for specific sections
  if (sectionId === 'clustering') {
    drawClustering();
  } else if (sectionId === 'routes') {
    drawRoute(currentZone);
    drawZoneComparisonChart();
  }
}

// Initialize navigation
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute('data-section');
      navigateTo(sectionId);
    });
  });
  
  // Initialize selects for algorithm comparison
  initializeAlgorithmSelects();
  
  // Draw initial visualizations
  drawClustering();
  drawRoute(currentZone);
  drawZoneComparisonChart();
});

// Clustering Visualization
function drawClustering() {
  const canvas = document.getElementById('clusteringCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const padding = 60;
  const scale = (Math.min(width, height) - 2 * padding) / 10;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Draw grid
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 10; i++) {
    const x = padding + i * scale;
    const y = padding + i * scale;
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, height - padding);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }
  
  // Draw axes labels
  ctx.fillStyle = '#000';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  for (let i = 0; i <= 10; i++) {
    const x = padding + i * scale;
    const y = padding + i * scale;
    ctx.fillText(i, x, height - padding + 20);
    ctx.fillText(i, padding - 20, height - y);
  }
  
  // Function to transform coordinates
  const toCanvasX = (x) => padding + x * scale;
  const toCanvasY = (y) => height - padding - y * scale;
  
  // Draw centroids
  clusters.forEach(cluster => {
    const cx = toCanvasX(cluster.centroid.x);
    const cy = toCanvasY(cluster.centroid.y);
    
    ctx.fillStyle = cluster.color;
    ctx.strokeStyle = cluster.color;
    ctx.lineWidth = 3;
    
    // Draw X mark
    const size = 12;
    ctx.beginPath();
    ctx.moveTo(cx - size, cy - size);
    ctx.lineTo(cx + size, cy + size);
    ctx.moveTo(cx + size, cy - size);
    ctx.lineTo(cx - size, cy + size);
    ctx.stroke();
  });
  
  // Draw points
  locations.forEach((loc, idx) => {
    if (idx === 0) {
      // Depot - draw as star
      const cx = toCanvasX(loc.x);
      const cy = toCanvasY(loc.y);
      drawStar(ctx, cx, cy, 5, 10, 5, '#000');
      
      ctx.fillStyle = '#000';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(loc.name, cx, cy + 20);
    } else {
      // Find cluster
      const cluster = clusters.find(c => c.points.includes(idx));
      if (cluster) {
        const cx = toCanvasX(loc.x);
        const cy = toCanvasY(loc.y);
        
        ctx.fillStyle = cluster.color;
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Label
        ctx.fillStyle = '#000';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(loc.name, cx, cy - 10);
      }
    }
  });
  
  // Update cluster stats
  updateClusterStats();
}

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, color) {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;
  
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;
    
    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function updateClusterStats() {
  const container = document.getElementById('clusterStats');
  if (!container) return;
  
  container.innerHTML = '';
  
  clusters.forEach(cluster => {
    const div = document.createElement('div');
    div.className = 'cluster-stat';
    div.style.borderLeftColor = cluster.color;
    div.innerHTML = `
      <h4 style="color: ${cluster.color}">${cluster.name}</h4>
      <p><strong>Pontos:</strong> ${cluster.stops}</p>
      <p><strong>Distância:</strong> ${cluster.distance.toFixed(2)} km</p>
      <p><strong>Demanda:</strong> ${cluster.demand} pedidos</p>
      <p><strong>Tempo:</strong> ${cluster.time} min</p>
    `;
    container.appendChild(div);
  });
}

// Route Visualization
function selectZone(zoneId) {
  currentZone = zoneId;
  
  document.querySelectorAll('.zone-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelector(`[data-zone="${zoneId}"]`).classList.add('active');
  
  drawRoute(zoneId);
}

function drawRoute(zoneId) {
  const canvas = document.getElementById('routeCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const padding = 60;
  const scale = (Math.min(width, height) - 2 * padding) / 10;
  
  const cluster = clusters[zoneId];
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Draw grid
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 10; i++) {
    const x = padding + i * scale;
    const y = padding + i * scale;
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, height - padding);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }
  
  const toCanvasX = (x) => padding + x * scale;
  const toCanvasY = (y) => height - padding - y * scale;
  
  // Draw route lines
  ctx.strokeStyle = cluster.color;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  
  for (let i = 0; i < cluster.route.length - 1; i++) {
    const fromLoc = locations[cluster.route[i]];
    const toLoc = locations[cluster.route[i + 1]];
    
    const x1 = toCanvasX(fromLoc.x);
    const y1 = toCanvasY(fromLoc.y);
    const x2 = toCanvasX(toLoc.x);
    const y2 = toCanvasY(toLoc.y);
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Draw arrow
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowLength = 10;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - arrowLength * Math.cos(angle - Math.PI / 6), y2 - arrowLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - arrowLength * Math.cos(angle + Math.PI / 6), y2 - arrowLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = cluster.color;
    ctx.fill();
    ctx.setLineDash([5, 5]);
  }
  
  ctx.setLineDash([]);
  
  // Draw points
  cluster.route.forEach((locId, idx) => {
    const loc = locations[locId];
    const cx = toCanvasX(loc.x);
    const cy = toCanvasY(loc.y);
    
    if (locId === 0) {
      // Depot
      drawStar(ctx, cx, cy, 5, 10, 5, '#000');
      ctx.fillStyle = '#000';
      ctx.font = 'bold 11px sans-serif';
    } else {
      // Regular point
      ctx.fillStyle = cluster.color;
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(idx, cx, cy);
      
      ctx.fillStyle = '#000';
      ctx.font = '11px sans-serif';
    }
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(loc.name, cx, cy + 15);
  });
  
  // Update route details
  updateRouteDetails(cluster);
}

function updateRouteDetails(cluster) {
  document.getElementById('routeTitle').textContent = cluster.name;
  
  const summaryDiv = document.getElementById('routeSummary');
  summaryDiv.innerHTML = `
    <div class="route-summary-item">
      <div class="route-summary-label">Distância Total</div>
      <div class="route-summary-value">${cluster.distance.toFixed(2)} km</div>
    </div>
    <div class="route-summary-item">
      <div class="route-summary-label">Paradas</div>
      <div class="route-summary-value">${cluster.stops}</div>
    </div>
    <div class="route-summary-item">
      <div class="route-summary-label">Demanda</div>
      <div class="route-summary-value">${cluster.demand}</div>
    </div>
    <div class="route-summary-item">
      <div class="route-summary-label">Tempo Estimado</div>
      <div class="route-summary-value">${cluster.time} min</div>
    </div>
  `;
  
  const sequenceDiv = document.getElementById('routeSequence');
  sequenceDiv.innerHTML = '';
  
  cluster.route.forEach((locId, idx) => {
    if (idx < cluster.route.length - 1) {
      const loc = locations[locId];
      const nextLoc = locations[cluster.route[idx + 1]];
      const dist = euclideanDistance(loc, nextLoc).toFixed(2);
      
      const stepDiv = document.createElement('div');
      stepDiv.className = 'route-step';
      stepDiv.innerHTML = `
        <div class="route-step-number">${idx + 1}</div>
        <div>
          <strong>${loc.name}</strong> → ${nextLoc.name}
          <span style="color: var(--color-text-secondary); margin-left: 8px;">${dist} km</span>
        </div>
      `;
      sequenceDiv.appendChild(stepDiv);
    }
  });
}

// Zone Comparison Chart
function drawZoneComparisonChart() {
  const canvas = document.getElementById('zoneComparisonChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const padding = {top: 40, right: 40, bottom: 60, left: 80};
  
  ctx.clearRect(0, 0, width, height);
  
  // Chart data
  const metrics = [
    {label: 'Distância (km)', values: clusters.map(c => c.distance), color: '#2196F3'},
    {label: 'Paradas', values: clusters.map(c => c.stops), color: '#4CAF50'},
    {label: 'Demanda', values: clusters.map(c => c.demand), color: '#F44336'},
    {label: 'Tempo (min)', values: clusters.map(c => c.time), color: '#FF9800'}
  ];
  
  const maxValue = Math.max(...metrics.flatMap(m => m.values));
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const barGroupWidth = chartWidth / clusters.length;
  const barWidth = barGroupWidth / (metrics.length + 1);
  
  // Draw axes
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, height - padding.bottom);
  ctx.lineTo(width - padding.right, height - padding.bottom);
  ctx.stroke();
  
  // Draw bars
  clusters.forEach((cluster, clusterIdx) => {
    const x = padding.left + clusterIdx * barGroupWidth;
    
    metrics.forEach((metric, metricIdx) => {
      const barHeight = (metric.values[clusterIdx] / maxValue) * chartHeight;
      const barX = x + metricIdx * barWidth + barWidth / 2;
      const barY = height - padding.bottom - barHeight;
      
      ctx.fillStyle = metric.color;
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // Value label
      ctx.fillStyle = '#000';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(metric.values[clusterIdx].toFixed(1), barX + barWidth / 2, barY - 5);
    });
    
    // Cluster label
    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(cluster.name, x + barGroupWidth / 2, height - padding.bottom + 25);
  });
  
  // Legend
  const legendX = padding.left;
  const legendY = 10;
  metrics.forEach((metric, idx) => {
    const x = legendX + idx * 150;
    ctx.fillStyle = metric.color;
    ctx.fillRect(x, legendY, 12, 12);
    ctx.fillStyle = '#000';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(metric.label, x + 18, legendY + 10);
  });
  
  // Y-axis label
  ctx.save();
  ctx.translate(20, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = '#000';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Valores', 0, 0);
  ctx.restore();
}

// Algorithm Comparison
function initializeAlgorithmSelects() {
  const originSelect = document.getElementById('originSelect');
  const destSelect = document.getElementById('destSelect');
  
  if (!originSelect || !destSelect) return;
  
  locations.forEach(loc => {
    const option1 = document.createElement('option');
    option1.value = loc.id;
    option1.textContent = loc.name;
    originSelect.appendChild(option1);
    
    const option2 = document.createElement('option');
    option2.value = loc.id;
    option2.textContent = loc.name;
    destSelect.appendChild(option2);
  });
  
  // Set default values
  originSelect.value = 0;
  destSelect.value = 10;
}

function calculateRoutes() {
  const originId = parseInt(document.getElementById('originSelect').value);
  const destId = parseInt(document.getElementById('destSelect').value);
  
  if (originId === destId) {
    alert('Por favor, selecione origem e destino diferentes.');
    return;
  }
  
  // Run algorithms
  const astarResult = astar(originId, destId);
  const bfsResult = bfs(originId, destId);
  const dfsResult = dfs(originId, destId);
  
  // Display results
  displayAlgorithmResults(astarResult, bfsResult, dfsResult);
  drawPathComparison(astarResult, bfsResult, dfsResult);
  drawPerformanceChart(astarResult, bfsResult, dfsResult);
  
  document.getElementById('algorithmResults').style.display = 'block';
}

// A* Algorithm
function astar(startId, goalId) {
  const start = locations[startId];
  const goal = locations[goalId];
  
  const openSet = new Set([startId]);
  const cameFrom = {};
  const gScore = {};
  const fScore = {};
  
  locations.forEach(loc => {
    gScore[loc.id] = Infinity;
    fScore[loc.id] = Infinity;
  });
  
  gScore[startId] = 0;
  fScore[startId] = euclideanDistance(start, goal);
  
  let nodesExplored = 0;
  
  while (openSet.size > 0) {
    let current = null;
    let minFScore = Infinity;
    
    openSet.forEach(id => {
      if (fScore[id] < minFScore) {
        minFScore = fScore[id];
        current = id;
      }
    });
    
    if (current === goalId) {
      const path = reconstructPath(cameFrom, current);
      const distance = calculatePathDistance(path);
      return {algorithm: 'A*', path, distance, nodesExplored};
    }
    
    openSet.delete(current);
    nodesExplored++;
    
    // Check neighbors
    locations.forEach(neighbor => {
      if (neighbor.id === current) return;
      
      const tentativeGScore = gScore[current] + distanceMatrix[current][neighbor.id];
      
      if (tentativeGScore < gScore[neighbor.id]) {
        cameFrom[neighbor.id] = current;
        gScore[neighbor.id] = tentativeGScore;
        fScore[neighbor.id] = gScore[neighbor.id] + euclideanDistance(neighbor, goal);
        openSet.add(neighbor.id);
      }
    });
  }
  
  return {algorithm: 'A*', path: [], distance: Infinity, nodesExplored};
}

// BFS Algorithm
function bfs(startId, goalId) {
  const queue = [startId];
  const visited = new Set([startId]);
  const cameFrom = {};
  let nodesExplored = 0;
  
  while (queue.length > 0) {
    const current = queue.shift();
    nodesExplored++;
    
    if (current === goalId) {
      const path = reconstructPath(cameFrom, current);
      const distance = calculatePathDistance(path);
      return {algorithm: 'BFS', path, distance, nodesExplored};
    }
    
    // Get neighbors sorted by distance
    const neighbors = locations
      .filter(loc => loc.id !== current && !visited.has(loc.id))
      .sort((a, b) => distanceMatrix[current][a.id] - distanceMatrix[current][b.id]);
    
    neighbors.forEach(neighbor => {
      if (!visited.has(neighbor.id)) {
        visited.add(neighbor.id);
        cameFrom[neighbor.id] = current;
        queue.push(neighbor.id);
      }
    });
  }
  
  return {algorithm: 'BFS', path: [], distance: Infinity, nodesExplored};
}

// DFS Algorithm
function dfs(startId, goalId) {
  const stack = [startId];
  const visited = new Set();
  const cameFrom = {};
  let nodesExplored = 0;
  
  while (stack.length > 0) {
    const current = stack.pop();
    
    if (visited.has(current)) continue;
    
    visited.add(current);
    nodesExplored++;
    
    if (current === goalId) {
      const path = reconstructPath(cameFrom, current);
      const distance = calculatePathDistance(path);
      return {algorithm: 'DFS', path, distance, nodesExplored};
    }
    
    // Get neighbors sorted by distance (reversed for DFS)
    const neighbors = locations
      .filter(loc => loc.id !== current && !visited.has(loc.id))
      .sort((a, b) => distanceMatrix[current][a.id] - distanceMatrix[current][b.id]);
    
    neighbors.reverse().forEach(neighbor => {
      if (!visited.has(neighbor.id)) {
        cameFrom[neighbor.id] = current;
        stack.push(neighbor.id);
      }
    });
  }
  
  return {algorithm: 'DFS', path: [], distance: Infinity, nodesExplored};
}

function reconstructPath(cameFrom, current) {
  const path = [current];
  while (cameFrom[current] !== undefined) {
    current = cameFrom[current];
    path.unshift(current);
  }
  return path;
}

function calculatePathDistance(path) {
  let distance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    distance += distanceMatrix[path[i]][path[i + 1]];
  }
  return distance;
}

function displayAlgorithmResults(astarResult, bfsResult, dfsResult) {
  const results = [astarResult, bfsResult, dfsResult];
  const minDistance = Math.min(...results.map(r => r.distance));
  
  const table = document.getElementById('resultsTable');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Algoritmo</th>
        <th>Caminho</th>
        <th>Distância (km)</th>
        <th>Nós Explorados</th>
      </tr>
    </thead>
    <tbody>
      ${results.map(result => {
        const isBest = result.distance === minDistance;
        const pathStr = result.path.map(id => locations[id].name).join(' → ');
        return `
          <tr ${isBest ? 'class="best-result"' : ''}>
            <td><strong>${result.algorithm}</strong></td>
            <td>${pathStr}</td>
            <td>${result.distance.toFixed(2)}</td>
            <td>${result.nodesExplored}</td>
          </tr>
        `;
      }).join('')}
    </tbody>
  `;
}

function drawPathComparison(astarResult, bfsResult, dfsResult) {
  const canvas = document.getElementById('pathCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const padding = 60;
  const scale = (Math.min(width, height) - 2 * padding) / 10;
  
  ctx.clearRect(0, 0, width, height);
  
  // Draw grid
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 10; i++) {
    const x = padding + i * scale;
    const y = padding + i * scale;
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, height - padding);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }
  
  const toCanvasX = (x) => padding + x * scale;
  const toCanvasY = (y) => height - padding - y * scale;
  
  // Draw paths
  const results = [
    {result: astarResult, color: '#2196F3', label: 'A*'},
    {result: bfsResult, color: '#4CAF50', label: 'BFS'},
    {result: dfsResult, color: '#F44336', label: 'DFS'}
  ];
  
  results.forEach(({result, color, label}, idx) => {
    if (result.path.length === 0) return;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([5 * (idx + 1), 5]);
    
    for (let i = 0; i < result.path.length - 1; i++) {
      const fromLoc = locations[result.path[i]];
      const toLoc = locations[result.path[i + 1]];
      
      const x1 = toCanvasX(fromLoc.x);
      const y1 = toCanvasY(fromLoc.y);
      const x2 = toCanvasX(toLoc.x);
      const y2 = toCanvasY(toLoc.y);
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  });
  
  ctx.setLineDash([]);
  
  // Draw all locations
  locations.forEach(loc => {
    const cx = toCanvasX(loc.x);
    const cy = toCanvasY(loc.y);
    
    ctx.fillStyle = '#ccc';
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, 2 * Math.PI);
    ctx.fill();
  });
  
  // Highlight start and end
  const startLoc = locations[results[0].result.path[0]];
  const endLoc = locations[results[0].result.path[results[0].result.path.length - 1]];
  
  const startX = toCanvasX(startLoc.x);
  const startY = toCanvasY(startLoc.y);
  const endX = toCanvasX(endLoc.x);
  const endY = toCanvasY(endLoc.y);
  
  ctx.fillStyle = '#4CAF50';
  ctx.beginPath();
  ctx.arc(startX, startY, 8, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.fillStyle = '#F44336';
  ctx.beginPath();
  ctx.arc(endX, endY, 8, 0, 2 * Math.PI);
  ctx.fill();
  
  // Labels
  ctx.fillStyle = '#000';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('INÍCIO', startX, startY - 15);
  ctx.fillText('FIM', endX, endY - 15);
  
  // Legend
  const legendY = 20;
  results.forEach(({label, color}, idx) => {
    const x = padding + idx * 120;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([5 * (idx + 1), 5]);
    ctx.beginPath();
    ctx.moveTo(x, legendY);
    ctx.lineTo(x + 40, legendY);
    ctx.stroke();
    
    ctx.fillStyle = '#000';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.setLineDash([]);
    ctx.fillText(label, x + 45, legendY + 5);
  });
}

function drawPerformanceChart(astarResult, bfsResult, dfsResult) {
  const canvas = document.getElementById('performanceChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const padding = {top: 60, right: 40, bottom: 80, left: 100};
  
  ctx.clearRect(0, 0, width, height);
  
  const results = [
    {label: 'A*', distance: astarResult.distance, nodes: astarResult.nodesExplored, color: '#2196F3'},
    {label: 'BFS', distance: bfsResult.distance, nodes: bfsResult.nodesExplored, color: '#4CAF50'},
    {label: 'DFS', distance: dfsResult.distance, nodes: dfsResult.nodesExplored, color: '#F44336'}
  ];
  
  const maxNodes = Math.max(...results.map(r => r.nodes));
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const barWidth = chartWidth / (results.length * 2);
  
  // Title
  ctx.fillStyle = '#000';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Nós Explorados por Algoritmo', width / 2, 30);
  
  // Draw axes
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, height - padding.bottom);
  ctx.lineTo(width - padding.right, height - padding.bottom);
  ctx.stroke();
  
  // Draw bars
  results.forEach((result, idx) => {
    const barHeight = (result.nodes / maxNodes) * chartHeight;
    const x = padding.left + idx * (chartWidth / results.length) + (chartWidth / results.length - barWidth) / 2;
    const y = height - padding.bottom - barHeight;
    
    ctx.fillStyle = result.color;
    ctx.fillRect(x, y, barWidth, barHeight);
    
    // Value label
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(result.nodes, x + barWidth / 2, y - 10);
    
    // Algorithm label
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(result.label, x + barWidth / 2, height - padding.bottom + 25);
    
    // Distance label
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText(`${result.distance.toFixed(2)} km`, x + barWidth / 2, height - padding.bottom + 45);
  });
  
  // Y-axis label
  ctx.save();
  ctx.translate(30, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = '#000';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Número de Nós Explorados', 0, 0);
  ctx.restore();
}