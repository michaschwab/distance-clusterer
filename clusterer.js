"use strict";
if(!exports) { var exports = {};}
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.Clusterer = Clusterer;
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
exports.Cluster = Cluster;
function getGaussian(mu, sigma) {
    var normalization = 1;
    return function (x) {
        return normalization * Math.exp(-Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2)));
    };
}
exports.getGaussian = getGaussian;
