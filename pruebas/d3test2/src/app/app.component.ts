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
  value: number;
  children?: Array<HierarchyDatum>;
}

const data: HierarchyDatum = {
  name: 'A1',
  value: 100,
  children: [
    {
      name: 'B1',
      value: 100,
      children: [
        {
          name: 'C1',
          value: 100,
          children: [
            {
              name: 'D1',
              value: 100,
              children: undefined
            },
            {
              name: 'D2',
              value: 300,
              children: undefined
            }
          ]
        },
        {
          name: 'C2',
          value: 300,
          children: undefined
        },
        {
          name: 'C3',
          value: 200,
          children: undefined
        }
      ]
    },
    {
      name: 'B1',
      value: 100,
      children: [
        {
          name: 'C1',
          value: 100,
          children: undefined
        },
        {
          name: 'C2',
          value: 300,
          children: [
            {
              name: 'D1',
              value: 100,
              children: undefined
            },
            {
              name: 'D2',
              value: 300,
              children: undefined
            }
          ]
        },
        {
          name: 'C3',
          value: 200,
          children: undefined
        }
      ]
    },
    {
      name: 'B2',
      value: 200,
      children: [
        {
          name: 'C4',
          value: 100,
          children: undefined
        },
        {
          name: 'C5',
          value: 300,
          children: undefined
        },
        {
          name: 'C6',
          value: 200,
          children: [
            {
              name: 'D3',
              value: 100,
              children: undefined
            },
            {
              name: 'D4',
              value: 300,
              children: undefined
            }
          ]
        }
      ]
    },

  ]
};

const data2: HierarchyDatum = {
  name: 'A1',
  value: 100,
  children: [
    {
      name: 'B1',
      value: 100,
      children: [
        {
          name: 'C1',
          value: 100,
          children: [
            {
              name: 'D1',
              value: 100,
              children: undefined
            },
            {
              name: 'D2',
              value: 300,
              children: undefined
            }
          ]
        },
        {
          name: 'C2',
          value: 300,
          children: undefined
        },
        {
          name: 'C3',
          value: 200,
          children: undefined
        }
      ]
    }
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

  public inst: number;
  public duration: number;
  public rectW: number;
  public rectH: number;
  public zm: any;
  public collapse : Function;
  public d: any;
  public error: any;
  public view: any;
  public parent: any;
  public visitFn: any;
  public childrenFn: any;
  public links: any;
  public maxLabelLength: any;
  public drag: any;
  public dragmove: any;
  public BRANCH_SPACE: number;

  public constructor() {
    this.inst = 1;
    this.duration = 750;
    this.rectW = 60;
    this.rectH = 30;
  }


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

   
    console.log('hijos', data);
    this.tree = tree<HierarchyDatum>();
    this.tree.size([this.height, this.width]);
    this.draw( this.tree(hierarchy<HierarchyDatum>(data)));

    

    this.draw(this.tree(hierarchy<HierarchyDatum>(data2)));

  }


  click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    console.log(d);
  }

  private draw(root: HierarchyPointNode<HierarchyDatum>) {

    
    const nodes = root.descendants().reverse();
    const links = root.links();


    // Nodes
    d3.select('svg g.nodes')
      .selectAll('circle.node')
      .data(nodes)
      .enter()
      .append('circle')
      .classed('node', true)
      .attr('style', 'fill: steelblue;stroke: #ccc;stroke-width: 3px; font: 10px sans-serif;')
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; })
      .attr('r', 8)
      .attr('pointer-events', 'all')
      .attr('cursor', 'pointer')
      .on('click', function (d) {
        console.log(d.name);
      })
      .append('text')
      .attr('dy', '0.31em')
        .attr('x',  13)
        .attr('text-anchor', 'start')
        .attr('style', 'fill-opacity:1e-6')
      .text( function(d) { return d.name;  })
      ;


     // Links
    d3.select('svg g.links')
      .selectAll('line.link')
      .data(links)
      .enter()
      .append('line')
      .classed('link', true)
      .attr('style', 'stroke: #555; stroke-opacity: 0.4; stroke-width:1.5;')
      .attr('x1', function (d) { return d.source.x; })
      .attr('y1', function (d) { return d.source.y; })
      .attr('x2', function (d) { return d.target.x; })
      .attr('y2', function (d) { return d.target.y; });
  }
}
