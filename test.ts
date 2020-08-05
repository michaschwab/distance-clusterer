import {Clusterer, getGaussian} from "./clusterer";
declare var d3: any;
type DataType = { x: number, y: number };

const random = new Array(100).fill(null)
    .map(() => { return {x: Math.random()*300, y: Math.random()*300}});
const colors = new Array(100).fill(null)
    .map(() => '#' + 'zzzzzz'.split('')
        .map(() => ('0123456789abcdef'.split(''))[Math.floor(Math.random()*16)]).join(''));

d3.select('#original').selectAll('circle').data(random).enter()
    .append('circle')
    .attr('cx', (d: DataType) => d.x)
    .attr('cy', (d: DataType) => d.y)
    .attr('r', 3).attr('fill', '#ccc').attr('stroke-width', 3);

const getAverage = (values: DataType[], key: keyof DataType) =>
    values.map(d => d[key]).reduce((d1, d2) => d1+d2) / values.length;

const clusterer = new Clusterer<DataType>()
    .setData(random)
    .setSortValue((a) => getAverage(a.getData(), 'x'));

(window as any).updateClusters = () => {
    const neighborCount = parseInt((document.getElementById('neighborCount') as HTMLInputElement).value);
    const sigma = parseInt((document.getElementById('sigma') as HTMLInputElement).value);
    const mergeScore = parseFloat((document.getElementById('mergeScore') as HTMLInputElement).value);

    clusterer.setScore((a, b) => {
        const [ax, ay] = [getAverage(a.getData(), 'x'), getAverage(a.getData(), 'y')];
        const [bx, by] = [getAverage(b.getData(), 'x'), getAverage(b.getData(), 'y')];
        const distance = Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));
        return getGaussian(0, sigma)(distance);
    }).cluster(neighborCount, mergeScore);

    const clusterData = clusterer.getClusters().map(c => c.getData()).sort((a, b) => getAverage(a, 'x') - getAverage(b, 'x') + getAverage(a, 'y') - getAverage(b, 'y'));
    clusterData.forEach((data, index) => {
        d3.select('#original').selectAll('circle').filter((pos: DataType) => data.includes(pos))
            .attr('fill', colors[index]);
    });

    console.log(clusterData);

    const clusters = d3.select('#clustered').selectAll('circle').data(clusterData);
    clusters.exit().remove();

    clusters.enter().append('circle').merge(clusters)
        .attr('cx', (d: DataType[]) => getAverage(d, 'x'))
        .attr('cy', (d: DataType[]) => getAverage(d, 'y'))
        .attr('r', (d: DataType[]) => 3*Math.sqrt(d.length))
        .attr('fill', (d: DataType[], i: number) => colors[i])
        .on('mouseover', (d: DataType[]) => {
            d3.select('#original').selectAll('circle').filter((pos: DataType) => d.includes(pos))
                .attr('stroke', 'red');
        }).on('mouseleave', (d: DataType[]) => {
            d3.select('#original').selectAll('circle').filter((pos: DataType) => d.includes(pos))
                .attr('stroke', '');
        });
}

(window as any).updateClusters();
