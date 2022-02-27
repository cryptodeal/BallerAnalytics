<div class="ticker-wrap">
	<div class="ticker">
		<div class="ticker__item">Letterpress chambray brunch.</div>
		<div class="ticker__item">
			Vice mlkshk crucifix beard chillwave meditation hoodie asymmetrical Helvetica.
		</div>
		<div class="ticker__item">Ugh PBR&B kale chips Echo Park.</div>
		<div class="ticker__item">Gluten-free mumblecore chambray mixtape food truck.</div>
		<!--<div class="ticker__item">Authentic bitters seitan pug single-origin coffee whatever.</div>
    <div class="ticker__item">Letterpress chambray brunch.</div>
    <div class="ticker__item">Vice mlkshk crucifix beard chillwave meditation hoodie asymmetrical Helvetica.</div>
    <div class="ticker__item">Ugh PBR&B kale chips Echo Park.</div>
    <div class="ticker__item">Gluten-free mumblecore chambray mixtape food truck. </div>
    <div class="ticker__item">Authentic bitters seitan pug single-origin coffee whatever.</div>-->
	</div>
</div>

<style>
	@-webkit-keyframes ticker {
		0% {
			-webkit-transform: translate3d(0, 0, 0);
			transform: translate3d(0, 0, 0);
			visibility: visible;
		}
		100% {
			-webkit-transform: translate3d(-100%, 0, 0);
			transform: translate3d(-100%, 0, 0);
		}
	}

	@keyframes ticker {
		0% {
			-webkit-transform: translate3d(0, 0, 0);
			transform: translate3d(0, 0, 0);
			visibility: visible;
		}
		100% {
			-webkit-transform: translate3d(-100%, 0, 0);
			transform: translate3d(-100%, 0, 0);
		}
	}

	.ticker-wrap {
		position: fixed;
		bottom: 0;
		width: 100%;
		overflow: hidden;
		height: 4rem;
		background-color: rgba(0, 0, 0, 0.9);
		padding-left: 100%;
		box-sizing: content-box;
	}

	.ticker-wrap .ticker {
		display: inline-block;
		height: 4rem;
		line-height: 4rem;
		white-space: nowrap;
		padding-right: 100%;
		box-sizing: content-box;
		-webkit-animation-iteration-count: infinite;
		animation-iteration-count: infinite;
		-webkit-animation-timing-function: linear;
		animation-timing-function: linear;
		-webkit-animation-name: ticker;
		animation-name: ticker;
		-webkit-animation-duration: 30s;
		animation-duration: 30s;
	}

	.ticker-wrap .ticker__item {
		display: inline-block;
		padding: 0 2rem;
		font-size: 2rem;
		color: white;
	}
</style>
