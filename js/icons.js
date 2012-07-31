var icons = {
	"github" : {
		icon     : "M92.71,44.408L52.591,4.291c-2.31-2.311-6.057-2.311-8.369,0l-8.33,8.332L46.459,23.19   c2.456-0.83,5.272-0.273,7.229,1.685c1.969,1.97,2.521,4.81,1.67,7.275l10.186,10.185c2.465-0.85,5.307-0.3,7.275,1.671   c2.75,2.75,2.75,7.206,0,9.958c-2.752,2.751-7.208,2.751-9.961,0c-2.068-2.07-2.58-5.11-1.531-7.658l-9.5-9.499v24.997   c0.67,0.332,1.303,0.774,1.861,1.332c2.75,2.75,2.75,7.206,0,9.959c-2.75,2.749-7.209,2.749-9.957,0c-2.75-2.754-2.75-7.21,0-9.959   c0.68-0.679,1.467-1.193,2.307-1.537V36.369c-0.84-0.344-1.625-0.853-2.307-1.537c-2.083-2.082-2.584-5.14-1.516-7.698   L31.798,16.715L4.288,44.222c-2.311,2.313-2.311,6.06,0,8.371l40.121,40.118c2.31,2.311,6.056,2.311,8.369,0L92.71,52.779   C95.021,50.468,95.021,46.719,92.71,44.408z",
		location : "https://github.com/goinvo/hGraph",
		scale	 : "scale(0.7)",
	},
};

$(document).ready(function(){
	$('.nav_opt').each(function(){
		var n = this.dataset.name,
			i = icons[n],
			w = this.offsetWidth,
			h = this.offsetHeight;
		
		this.ctx = d3.select(this).append("svg")
						.attr("width",w)
						.attr("height",h)
						.attr("class","nav_svg");
		this.ico = this.ctx.append("path")
						.attr("d",i.icon)
						.attr("fill","#aaa")
						.attr("transform",i.scale)
						.attr("class","nav_icon");
		this.ico.on("click",function(){
			window.location = i.location;
		});
	});
});