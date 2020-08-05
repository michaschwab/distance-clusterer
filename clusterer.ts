export class Clusterer<T> {
    private data?: T[];
    private scoreFct?: (clusterA: Cluster<T>, clusterB: Cluster<T>) => number;
    private sortFct?: (cluster: Cluster<T>) => number;
    private clusters?: Cluster<T>[];

    setData(data: T[]): Clusterer<T> {
        this.data = data;
        return this;
    }

    setSortValue(sortFct: (cluster: Cluster<T>) => number): Clusterer<T> {
        this.sortFct = sortFct;
        return this;
    }

    setScore(distFct: (clusterA: Cluster<T>, clusterB: Cluster<T>) => number): Clusterer<T> {
        this.scoreFct = distFct;
        return this;
    }

    cluster(neighborPointCount: number, mergeScore: number): Clusterer<T> {
        if(!this.data || !this.sortFct || !this.scoreFct) {
            throw new Error('Data, sort function, or score function not specified.');
        }
        this.clusters = this.data.map(p => new Cluster([p]));

        this.clusters.sort((a, b) => this.sortFct!(a) - this.sortFct!(b));
        let merging = true;

        while(merging) {
            merging = false;

            for(let i = 0; i < this.clusters.length; i++) {
                let point = this.clusters[i];

                let neighborEnd = i + neighborPointCount + 1;

                for(let j = i+1; j < neighborEnd && j < this.clusters.length; j++) {
                    let neighborPoint = this.clusters[j];
                    let score = this.scoreFct(point, neighborPoint);

                    if(score > mergeScore) {
                        point.merge(neighborPoint);
                        this.clusters.splice(j,1);
                        merging = true;
                    }
                }
            }
        }

        return this;
    }

    getClusters(): Cluster<T>[] {
        if(!this.clusters) {
            throw new Error('Clustering not yet executed.');
        }
        return this.clusters;
    }
}

export class Cluster<T> {
    private data: T[];

    constructor(data: T[]) {
        this.data = data;
    }

    getData(): T[] {
        return this.data;
    }

    merge(cluster: Cluster<T>) : Cluster<T> {
        this.data = this.data.concat(cluster.getData());
        return this;
    }
}


export function getGaussian(mu: number, sigma: number): ((x: number) => number) {
    let normalization = 1;
    return (x: number) => {
        return normalization * Math.exp(- Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2)));
    }
}
