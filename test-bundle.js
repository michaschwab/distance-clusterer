'use strict';

var Clusterer = /** @class */ (function () {
    function Clusterer() {
    }
    Clusterer.prototype.setData = function (data) {
        this.data = data;
        return this;
    };
    Clusterer.prototype.setSortValue = function (sortFct) {
        this.sortFct = sortFct;
        return this;
    };
    Clusterer.prototype.setScore = function (distFct) {
        this.scoreFct = distFct;
        return this;
    };
    Clusterer.prototype.cluster = function (neighborPointCount, mergeScore) {
        var _this = this;
        if (!this.data || !this.sortFct || !this.scoreFct) {
            throw new Error('Data, sort function, or score function not specified.');
        }
        this.clusters = this.data.map(function (p) { return new Cluster([p]); });
        this.clusters.sort(function (a, b) { return _this.sortFct(a) - _this.sortFct(b); });
        var merging = true;
        while (merging) {
            merging = false;
            for (var i = 0; i < this.clusters.length; i++) {
                var point = this.clusters[i];
                var neighborEnd = i + neighborPointCount + 1;
                for (var j = i + 1; j < neighborEnd && j < this.clusters.length; j++) {
                    var neighborPoint = this.clusters[j];
                    var score = this.scoreFct(point, neighborPoint);
                    if (score > mergeScore) {
                        point.merge(neighborPoint);
                        this.clusters.splice(j, 1);
                        merging = true;
                    }
                }
            }
        }
        return this;
    };
    Clusterer.prototype.getClusters = function () {
        if (!this.clusters) {
            throw new Error('Clustering not yet executed.');
        }
        return this.clusters;
    };
    return Clusterer;
}());
var Cluster = /** @class */ (function () {
    function Cluster(data) {
        this.data = data;
    }
    Cluster.prototype.getData = function () {
        return this.data;
    };
    Cluster.prototype.merge = function (cluster) {
        this.data = this.data.concat(cluster.getData());
        return this;
    };
    return Cluster;
}());
function getGaussian(mu, sigma) {
    var normalization = 1;
    return function (x) {
        return normalization * Math.exp(-Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2)));
    };
}

var random = new Array(100).fill(null)
    .map(function () { return { x: Math.random() * 300, y: Math.random() * 300 }; });
var colors = new Array(100).fill(null)
    .map(function () { return '#' + 'zzzzzz'.split('')
    .map(function () { return ('0123456789abcdef'.split(''))[Math.floor(Math.random() * 16)]; }).join(''); });
d3.select('#original').selectAll('circle').data(random).enter()
    .append('circle')
    .attr('cx', function (d) { return d.x; })
    .attr('cy', function (d) { return d.y; })
    .attr('r', 3).attr('fill', '#ccc').attr('stroke-width', 3);
var getAverage = function (values, key) {
    return values.map(function (d) { return d[key]; }).reduce(function (d1, d2) { return d1 + d2; }) / values.length;
};
var clusterer = new Clusterer()
    .setData(random)
    .setSortValue(function (a) { return getAverage(a.getData(), 'x'); });
window.updateClusters = function () {
    var neighborCount = parseInt(document.getElementById('neighborCount').value);
    var sigma = parseInt(document.getElementById('sigma').value);
    var mergeScore = parseFloat(document.getElementById('mergeScore').value);
    clusterer.setScore(function (a, b) {
        var _a = [getAverage(a.getData(), 'x'), getAverage(a.getData(), 'y')], ax = _a[0], ay = _a[1];
        var _b = [getAverage(b.getData(), 'x'), getAverage(b.getData(), 'y')], bx = _b[0], by = _b[1];
        var distance = Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));
        return getGaussian(0, sigma)(distance);
    }).cluster(neighborCount, mergeScore);
    var clusterData = clusterer.getClusters().map(function (c) { return c.getData(); }).sort(function (a, b) { return getAverage(a, 'x') - getAverage(b, 'x') + getAverage(a, 'y') - getAverage(b, 'y'); });
    clusterData.forEach(function (data, index) {
        d3.select('#original').selectAll('circle').filter(function (pos) { return data.includes(pos); })
            .attr('fill', colors[index]);
    });
    console.log(clusterData);
    var clusters = d3.select('#clustered').selectAll('circle').data(clusterData);
    clusters.exit().remove();
    clusters.enter().append('circle').merge(clusters)
        .attr('cx', function (d) { return getAverage(d, 'x'); })
        .attr('cy', function (d) { return getAverage(d, 'y'); })
        .attr('r', function (d) { return 3 * Math.sqrt(d.length); })
        .attr('fill', function (d, i) { return colors[i]; })
        .on('mouseover', function (d) {
        d3.select('#original').selectAll('circle').filter(function (pos) { return d.includes(pos); })
            .attr('stroke', 'red');
    }).on('mouseleave', function (d) {
        d3.select('#original').selectAll('circle').filter(function (pos) { return d.includes(pos); })
            .attr('stroke', '');
    });
};
window.updateClusters();
