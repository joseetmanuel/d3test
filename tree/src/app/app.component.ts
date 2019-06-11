import { Component, AfterContentInit } from '@angular/core';
import * as d3 from 'd3';
import {
  hierarchy,
  HierarchyNode,
  HierarchyPointNode,
  HierarchyLink,
  HierarchyPointLink,
  StratifyOperator,
  TreeLayout,
  tree,
  ClusterLayout,
  cluster
} from 'd3-hierarchy';

interface HierarchyDatum {
  name: string;
  value: string;
  id: number;
  children?: Array<HierarchyDatum>;
}

const data: HierarchyDatum = {
  name: 'A1',
  value: 'A1',
  id: 0,
  children: [
    {
      name: 'B1',
      value: 'B1',
      id: 1,
      children: [
        {
          name: 'C1',
          value: 'C1',
          id: 4,
          children: [
            {
              name: 'D1',
              value: 'D1',
              id: 10,
              children: undefined
            },
            {
              name: 'D2',
              value: 'D2',
              id: 11,
              children: undefined
            }
          ]
        },
        {
          name: 'C2',
          value: 'C2',
          id: 5,
          children: undefined
        },
        {
          name: 'C3',
          value: 'C3',
          id: 6,
          children: undefined
        }
      ]
    },
    {
      name: 'B2',
      value: 'B2',
      id: 2,
      children: [
        {
          name: 'C1',
          value: 'C1',
          id: 7,
          children: undefined
        },
        {
          name: 'C2',
          value: 'C2',
          id: 8,
          children: [
            {
              name: 'D1',
              value: 'D1',
              id: 12,
              children: undefined
            },
            {
              name: 'D2',
              value: 'D2',
              id: 13,
              children: undefined
            }
          ]
        },
        {
          name: 'C3',
          value: 'C3',
          id: 9,
          children: undefined
        }
      ]
    },
    {
      name: 'B3',
      value: 'B3',
      id: 3,
      children: [
        {
          name: 'C4',
          value: 'C4',
          id: 14,
          children: undefined
        },
        {
          name: 'C5',
          value: 'C5',
          id: 15,
          children: undefined
        },
        {
          name: 'C6',
          value: 'C6',
          id: 16,
          children: [
            {
              name: 'D3',
              value: 'D3',
              id: 17,
              children: undefined
            },
            {
              name: 'D4',
              value: 'D4',
              id: 18,
              children: undefined
            }
          ]
        }
      ]
    },

  ]
};


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements AfterContentInit {
  title = 'd3test';
  radius = 120;
  private margin: any = { top: 20, right: 120, bottom: 20, left: 120 };
  private width: number;
  private height: number;
  private root: HierarchyPointNode<HierarchyDatum>;
  private tree: TreeLayout<HierarchyDatum>;
  private svg: any;
  private diagonal: any;



  ngAfterContentInit() {
    this.width = 720 - this.margin.right - this.margin.left;
    this.height = 640 - this.margin.top - this.margin.bottom;
    this.svg = d3.select('.container').append('svg')
      .attr('width', this.width + this.margin.right + this.margin.left)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
      .attr('class', 'g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    d3.select('svg g.g')
      .append('g')
      .attr('class', 'links');

    d3.select('svg g.g')
      .append('g')
      .attr('class', 'nodes');

    this.tree = tree<HierarchyDatum>();
    this.tree.size([this.height, this.width]);
    // this.tree.each(this.collapse);
    this.draw(this.tree(hierarchy<HierarchyDatum>(data)));
    // this.draw(this.tree(hierarchy<HierarchyDatum>(data2)));
  }

  draw(root: HierarchyPointNode<HierarchyDatum>) {
    const nodes = root.descendants().reverse();
    const links = root.links();

    //   root.children.forEach(collapse);

    function click(d, linksC) {
      if (d.children) {
        collapse(d, linksC);
      } else if (d._children) {
        agrega(d);
      }
    }

    function collapse(d, linksC) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
        // const node = d3.select('circle.node' + d.data.id);
        const node = d3.selectAll('circle.node' + d.data.id)
          .data(d);
        const nodeExit = node.exit().transition()
          .duration(750)
          .attr('transform', function (d1) {
            return 'translate(' + (d.y - d1.y) + ',' + (d.x - d1.x) + ')';
          })
          .remove();

          console.log(linksC);
        const lnk = d3.selectAll('line.link')
          .data(linksC, function(d1) { return d1.id; });

        const linkExit = lnk.exit().transition()
          .duration(750)
          .attr('d', function (d1) { return link(d1); })
          .remove();
      }
    }


    function agrega(d) {
      if (d._children) {
        d.children = d._children;
        d.children.forEach(agrega);

        let nodesAdd = [], i = 1;
        d.children.forEach(n => {
          nodesAdd[i] = n; i++;
        });

        d3.select('svg g.nodes')
          .selectAll('circle.node')
          .data(nodesAdd)
          .enter()
          .append('circle')
          .attr('class', function (d1) {
            return 'node' + (d1 ? d.data.id : '');
          })
          .attr('style', function (d1) {
            if (d1) {
              return (d1.children ?
                'fill: steelblue; stroke: #ccc; stroke-width: 1px;' :
                'node--leaf'
              );
            }
          })
          .attr('cy', function (d1) { if (d1) { return d1.x; } })
          .attr('cx', function (d1) { if (d1) { return d1.y; } })
          .attr('r', 8)
          .attr('pointer-events', 'all')
          .attr('cursor', 'pointer')
          .attr('id', function (d1) { if (d1) { return d1.data.id; } })
          .on('click', function (d1) { if (d1) { click(d1,null); } })
          .transition()
          .duration(0)
          .attr('transform', function (d1) {
            if (d1) {
              return 'translate(' + (d.y - d1.y) + ',' + (d.x - d1.x) + ')';
            }
          })
          .transition()
          .duration(750)
          .attr('transform', function (d1) { if (d1) {return 'translate(0,0)'; }})
          ;
      }
    }

    // Nodes
    d3.select('svg g.nodes')
      .selectAll('circle.node')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', function (d) { return 'node' + (d.parent ? d.parent.data.id : ''); })
      .attr('style',
        function (d) {
          return (d.children ?
            'fill: steelblue; stroke: #ccc; stroke-width: 1px;' :
            'node--leaf'
          );
        })
      .attr('cy', function (d) { return d.x; })
      .attr('cx', function (d) { return d.y; })
      .attr('r', 8)
      .attr('pointer-events', 'all')
      .attr('cursor', 'pointer')
      .attr('id', function (d) { return d.data.id; })
      .on('click', function (d) {
        click(d, links);
      });

    // Etiquetas
    d3.select('svg g.nodes')
      .selectAll('text.node')
      .data(nodes)
      .enter()
      .append('text')
      .text(function (d) { return d.data.name; })
      .attr('y', function (d) { return d.x - 10; })
      .attr('x', function (d) { return d.y; })
      .attr('style', 'font: 10px sans-serif;')
      ;

    const link = d3.linkHorizontal()
      .y(function (d) {
        return d.x;
      })
      .x(function (d) {
        return d.y;
      });
    // Links
    d3.select('svg g.links')
      .selectAll('line.link')
      .data(links)
      .enter()
      .append('path')
      .attr('d', function (d) { return link(d); })
      .attr('style', 'fill:none; stroke: darkslateblue; stroke-opacity: 0.4; stroke-width:1px;');
  }
}
