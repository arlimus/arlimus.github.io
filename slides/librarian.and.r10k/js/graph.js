function showGraph( links, elem_selector, opts ) {

  var opts = opts || {};
  var w = opts.width || 600,
      h = opts.height || 600;
  var linkDistance = opts.linkDistance || (w/10);
  var charge = opts.charge || -300;
  var circleRadius = opts.circleRadius || 6;

  //sort links by source, then target
  links.sort(function(a,b) {
      if (a.source > b.source) {return 1;}
      else if (a.source < b.source) {return -1;}
      else {
          if (a.target > b.target) {return 1;}
          if (a.target < b.target) {return -1;}
          else {return 0;}
      }
  });

  //any links with duplicate source and target get an incremented 'linknum'
  for (var i=0; i<links.length; i++) {
      if (i != 0 &&
          links[i].source == links[i-1].source &&
          links[i].target == links[i-1].target) {
              links[i].linknum = links[i-1].linknum + 1;
          }
      else {links[i].linknum = 1;};
  };

  var nodes = {};
  var ok_links = [];

  // Compute the distinct nodes from the links.
  links.forEach(function(link) {
    if(link.source !== undefined && link.target !== undefined) {  
      ok_links.push(link)
    }
    if(link.source !== undefined) {  
      link.source = nodes[link.source] || (nodes[link.source] = {name: link.source, style: link.source_style});
    }
    if(link.target !== undefined) {  
      link.target = nodes[link.target] || (nodes[link.target] = {name: link.target, style: link.target_style});
    }
  });

  var force = d3.layout.force()
      .nodes(d3.values(nodes))
      .links(ok_links)
      .size([w, h])
      .linkDistance(linkDistance)
      .charge(charge)
      .on("tick", tick)
      .start();

  d3.select(elem_selector).select("svg").remove();
  var svg = d3.select(elem_selector).append("svg:svg")
      .attr("width", w)
      .attr("height", h);

  // Per-type markers, as they don't inherit styles.
  svg.append("svg:defs").selectAll("marker")
      .data(["normal","dashed","special"])
    .enter().append("svg:marker")
      .attr("id", String)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", circleRadius*2)
      .attr("refY", -1.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
    .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");

  var path = svg.append("svg:g").selectAll("path")
      .data(force.links())
    .enter().append("svg:path")
      .attr("class", function(d) { return "link " + d.type; })
      .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

  var circle = svg.append("svg:g").selectAll("circle")
      .data(force.nodes())
    .enter().append("svg:circle")
      .attr("r", circleRadius)
      .attr("class", function(d){return d.name;})
      .attr("style", function(d){return d.style;})
      .call(force.drag);

  var text = svg.append("svg:g").selectAll("g")
      .data(force.nodes())
    .enter().append("svg:g");

  // A copy of the text with a thick white stroke for legibility.
  text.append("svg:text")
      .attr("x", 1.2*circleRadius)
      .attr("y", ".31em")
      .attr("class", "shadow")
      .text(function(d) { return d.name; });

  text.append("svg:text")
      .attr("x", 1.2*circleRadius)
      .attr("y", ".31em")
      .attr("class", function(d){return d.name;})
      .text(function(d) { return d.name; });

  // Use elliptical arc path segments to doubly-encode directionality.
  function tick() {
    path.attr("d", function(d) {
      var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = (linkDistance * 1.2)/d.linknum;  //linknum is defined above
      return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
    });

    circle.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

    text.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  }
}

function updateFragments(prefix, f) {

  Reveal.addEventListener( 'fragmentshown', function(event){
    var id = event.fragment.id;
    if(id.startsWith(prefix + "-")) {
      var sub = parseInt( id.slice(prefix.length+1, id.length) );
      f( sub )
    }
  });
  Reveal.addEventListener( 'fragmenthidden', function(event){
    var id = event.fragment.id;
    if(id.startsWith(prefix + "-")) {
      var sub = parseInt( id.slice(prefix.length+1, id.length) );
      f( sub - 1 )
    }
  });
}

function showMultiGraph(multiLinks, id, opts) {
  updateFunc = function( fragment ) {
    if(fragment === undefined) {
      fragment = 0
    }
    var cg = JSON.parse(JSON.stringify( multiLinks[fragment] ));
    showGraph( cg, "#"+id, opts )
  }
  updateFunc()
  updateFragments(id, updateFunc)

  for( i = 1; i < multiLinks.length; i ++ ){ 
    $("#"+id).after('<span class="fragment" id="depsGraph-'+i+'"></span>')
  }
}
