// ==UserScript==
// @name         Toronto Star Dark Mode
// @namespace    https://github.com/gtalusan/tampermonkey-torstar-darkmode
// @version      1.0.0
// @description  Dark mode for www.thestar.com — the Toronto Star, branded on-site as "The Star". Converts the site's bright white layout to a dark theme.
// @author       george
// @match        https://www.thestar.com/*
// @match        https://thestar.com/*
// @match        http://www.thestar.com/*
// @match        http://thestar.com/*
// @noframes
// @run-at       document-start
// @grant        none
// @license      MIT
// ==/UserScript==

// The Toronto Star's site (thestar.com, branded "The Star"; TownNews/BLOX
// platform) defines its colours as CSS custom properties on :root plus a
// pile of hard-coded Bootstrap whites. This script
// (1) overrides the design tokens, (2) patches the hard-coded components, and
// (3) keeps its stylesheet last in <head> so it wins cascade ties.
//
// The same template runs on Torstar's sister papers (thespec.com,
// toronto.com, niagarafallsreview.ca, ...). To enable this script there,
// copy the @match lines above and change the domain.

(function () {
    'use strict';

    const STYLE_ID = 'tstar-dark-mode-style';

    const CSS = `
/* ==========================================================================
   1. Design tokens (site CSS variables)
   ========================================================================== */
html.tstar-dark {
    color-scheme: dark;

    --site-bg-color: #111418 !important;
    --content-bg-color: #181c22 !important;
    --content-text-color: #d7dce2 !important;
    --body-text-color: #d7dce2 !important;
    --link-color: #6fa8f0 !important;
    --accent-color: #6fa8f0 !important;
    --accent-color2: #6fa8f0 !important;
    --accent-color3: #5a97e0 !important;
    --accent-color4: #5a97e0 !important;
    --accent-color2-community: #55b585 !important;
    --accent-color3-community: #55b585 !important;
    --brand-star-hover: #5a97e0 !important;
    --breaking-news-developing: #6fa8f0 !important;
    --captions-color1: #99a2ac !important;
    --icon-alert-light: #f28b82 !important;
    --ai-summary-border-color: rgba(111, 168, 240, 0.55) !important;
    --nav-bg-color: #181c22 !important;
    --nav-link-color: #d7dce2 !important;
    --top-bar-bg-color: #161a20 !important;
    --top-bar-link-color: #d7dce2 !important;
    --masthead-bg-color: #111418 !important;
    --footer-bg-color: #0d0f12 !important;
    --footer-text-color: #aab2bc !important;
    --paywall-offer-bg: #12283e !important;
    --paywall-offer-bg-gradient: radial-gradient(circle, #12283e 0%, #12283e 100%) !important;
    --subscriber-newsletter-label-border: #6fa8f0 !important;
}

/* ==========================================================================
   2. Base
   ========================================================================== */
html.tstar-dark body {
    background-color: var(--site-bg-color) !important;
    color: var(--body-text-color) !important;
}

html.tstar-dark ::selection {
    background-color: #2d4c77;
    color: #ffffff;
}

html.tstar-dark .text-muted {
    color: #99a2ac !important;
}

/* ==========================================================================
   3. Header: top bar, weather, masthead, search
   ========================================================================== */
html.tstar-dark #site-top-nav,
html.tstar-dark #topbar-col-one,
html.tstar-dark #topbar-col-two,
html.tstar-dark #topbar-col-three {
    background-color: var(--top-bar-bg-color) !important;
    color: var(--top-bar-link-color) !important;
}

html.tstar-dark #site-top-nav a {
    color: var(--top-bar-link-color);
}

html.tstar-dark .weather-current,
html.tstar-dark .weather-current a {
    color: var(--top-bar-link-color) !important;
}

html.tstar-dark .weather-currentDate,
html.tstar-dark .weather-date-separator {
    color: #99a2ac !important;
}

html.tstar-dark .site-logo-container,
html.tstar-dark .site-masthead {
    background-color: var(--masthead-bg-color) !important;
}

/* The masthead logo is black-on-transparent PNG art; invert it so it reads
   on a dark background (hue-rotate restores the original blue hues). */
html.tstar-dark .site-logo-desktop,
html.tstar-dark .site-logo-mobile,
html.tstar-dark .navbar-brand img,
html.tstar-dark .mobile-logo img,
html.tstar-dark .nav-logo .img-responsive {
    filter: invert(1) hue-rotate(180deg);
}

html.tstar-dark .site-search-form,
html.tstar-dark #search-form-collapse {
    background-color: #161a20 !important;
}

/* ==========================================================================
   4. Navigation bar
   ========================================================================== */
/* The site has several high-specificity white rules for the sticky header
   (#site-container #site-navbar-container, the :not(.has_subnav) rule and
   the .affix state). Each selector below is written to beat its twin. */
html.tstar-dark #site-navbar-container,
html.tstar-dark #site-container #site-navbar-container,
html.tstar-dark #site-navbar-container:not(.has_subnav),
html.tstar-dark #site-navbar-container.affix,
html.tstar-dark #site-navbar-container.affix #main-navigation,
html.tstar-dark #navbar-collapse,
html.tstar-dark #main-navigation,
html.tstar-dark #site-navbar-container .navbar {
    background: var(--nav-bg-color) !important;
    border-color: #2a3038 !important;
}

html.tstar-dark .navbar-default {
    background-color: var(--nav-bg-color) !important;
    border-color: #2a3038 !important;
}

html.tstar-dark .navbar-default .navbar-nav > li > a {
    color: var(--nav-link-color) !important;
}

html.tstar-dark .navbar-default .navbar-nav > li > a:hover,
html.tstar-dark .navbar-default .navbar-nav > li > a:focus {
    color: #8abcf5 !important;
}

html.tstar-dark .navbar-default .navbar-nav > .active > a,
html.tstar-dark .navbar-default .navbar-nav > .open > a {
    background-color: #20262e !important;
    color: #ffffff !important;
}

html.tstar-dark .navbar-default .navbar-toggle {
    border-color: #39414c !important;
}

html.tstar-dark .navbar-default .navbar-toggle .icon-bar {
    background-color: #c9ced6 !important;
}

html.tstar-dark .navbar-default .navbar-toggle:hover,
html.tstar-dark .navbar-default .navbar-toggle:focus {
    background-color: #20262e !important;
}

html.tstar-dark .navbar-section .topNav a,
html.tstar-dark .navbar-section .subNav a,
html.tstar-dark #main-body-container .navbar-section .topNav li a {
    color: #c9ced6 !important;
}

/* Section sub-menu strips: the band of section links that appears under the
   main nav (one per nav item, e.g. #main-nav_menu-child-1 for Home).
   The site hard-codes a light grey background here. */
html.tstar-dark .subNav.dropdown {
    background: #1a1e24 !important;
    border-bottom: 1px solid #2a3038 !important;
}

html.tstar-dark #main-navigation .subNav.dropdown ul {
    background: #1f242c !important;
}

html.tstar-dark #main-navigation .subNav.dropdown li > a {
    color: #d7dce2 !important;
}

html.tstar-dark #main-navigation .subNav.dropdown li > a:hover {
    color: #8abcf5 !important;
}

/* ==========================================================================
   5. Bootstrap 3 components
   ========================================================================== */

/* panels */
html.tstar-dark .panel,
html.tstar-dark .panel-default {
    background-color: #181c22 !important;
    border-color: #2a3038 !important;
    color: var(--body-text-color);
}

html.tstar-dark .panel-default > .panel-heading {
    background-color: #1d222a !important;
    color: #d7dce2 !important;
    border-color: #2a3038 !important;
}

html.tstar-dark .panel-heading .panel-title,
html.tstar-dark .panel-title a {
    color: #eef1f5 !important;
}

html.tstar-dark .panel-footer {
    background-color: #1d222a !important;
    border-top-color: #2a3038 !important;
}

/* dropdown menus */
html.tstar-dark .dropdown-menu {
    background-color: #1f242c !important;
    border-color: #2a3038 !important;
}

html.tstar-dark .dropdown-menu > li > a {
    color: #d7dce2 !important;
}

html.tstar-dark .dropdown-menu > li > a:hover,
html.tstar-dark .dropdown-menu > li > a:focus {
    background-color: #2a313b !important;
    color: #ffffff !important;
}

html.tstar-dark .dropdown-menu > .active > a,
html.tstar-dark .dropdown-menu > .active > a:hover {
    background-color: #2a313b !important;
    color: #ffffff !important;
}

html.tstar-dark .dropdown-menu .divider {
    background-color: #2a3038 !important;
}

html.tstar-dark .dropdown-header {
    color: #99a2ac !important;
}

/* forms */
html.tstar-dark .form-control,
html.tstar-dark input.form-control,
html.tstar-dark textarea.form-control,
html.tstar-dark select.form-control {
    background-color: #161a20 !important;
    color: #d7dce2 !important;
    border-color: #333a44 !important;
}

html.tstar-dark .form-control:focus {
    border-color: #6fa8f0 !important;
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px rgba(111, 168, 240, 0.35) !important;
}

html.tstar-dark .form-control::placeholder {
    color: #6b7480 !important;
}

html.tstar-dark select.form-control option {
    background-color: #1f242c !important;
    color: #d7dce2 !important;
}

html.tstar-dark .input-group-addon {
    background-color: #1d222a !important;
    color: #99a2ac !important;
    border-color: #333a44 !important;
}

/* buttons */
html.tstar-dark .btn-default {
    background-color: #232a33 !important;
    color: #d7dce2 !important;
    border-color: #39414c !important;
}

html.tstar-dark .btn-default:hover,
html.tstar-dark .btn-default:focus,
html.tstar-dark .btn-default:active,
html.tstar-dark .btn-default.active {
    background-color: #2a313b !important;
    color: #ffffff !important;
    border-color: #4a5564 !important;
}

html.tstar-dark .btn-primary {
    background-color: #2d5d9c !important;
    border-color: #2d5d9c !important;
    color: #ffffff !important;
}

html.tstar-dark .btn-primary:hover,
html.tstar-dark .btn-primary:focus {
    background-color: #3a6fb3 !important;
    border-color: #3a6fb3 !important;
}

html.tstar-dark .btn-link {
    color: #6fa8f0 !important;
}

html.tstar-dark .btn-success {
    background-color: #1e5c3a !important;
    border-color: #1e5c3a !important;
}

html.tstar-dark .btn-danger {
    background-color: #8c2b2b !important;
    border-color: #8c2b2b !important;
}

html.tstar-dark .btn-warning {
    background-color: #8a6a1e !important;
    border-color: #8a6a1e !important;
}

html.tstar-dark .btn-info {
    background-color: #1d5a7c !important;
    border-color: #1d5a7c !important;
}

html.tstar-dark .close {
    color: #c9ced6 !important;
    text-shadow: none !important;
}

/* labels, badges, flags */
html.tstar-dark .label-default {
    background-color: #2a313b !important;
    color: #c9ced6 !important;
}

html.tstar-dark .label-primary {
    background-color: #2d5d9c !important;
}

html.tstar-dark .badge {
    background-color: #2a313b !important;
    color: #c9ced6 !important;
}

/* modals */
html.tstar-dark .modal-content {
    background-color: #1b1f26 !important;
    border-color: #2a3038 !important;
    color: #d7dce2;
}

html.tstar-dark .modal-header {
    border-bottom-color: #2a3038 !important;
}

html.tstar-dark .modal-footer {
    border-top-color: #2a3038 !important;
}

html.tstar-dark .modal-backdrop.in {
    opacity: 0.75;
}

/* lists, tables, wells, alerts, misc */
html.tstar-dark .list-group-item {
    background-color: #181c22 !important;
    border-color: #2a3038 !important;
    color: #d7dce2 !important;
}

html.tstar-dark .list-group-item.active {
    background-color: #2d5d9c !important;
    border-color: #2d5d9c !important;
}

html.tstar-dark table,
html.tstar-dark .table {
    background-color: transparent !important;
    color: var(--body-text-color);
}

html.tstar-dark .table > thead > tr > th,
html.tstar-dark .table > tbody > tr > td {
    border-top-color: #2a3038 !important;
}

html.tstar-dark .table-striped > tbody > tr:nth-of-type(odd) {
    background-color: #1a1e24 !important;
}

html.tstar-dark .thumbnail {
    background-color: #181c22 !important;
    border-color: #2a3038 !important;
}

html.tstar-dark .well {
    background-color: #171b21 !important;
    border-color: #2a3038 !important;
    color: #d7dce2;
}

html.tstar-dark .jumbotron {
    background-color: #1a1e24 !important;
}

html.tstar-dark .breadcrumb {
    background-color: transparent !important;
}

html.tstar-dark .breadcrumb > li a,
html.tstar-dark .breadcrumb > li + li:before {
    color: #99a2ac !important;
}

html.tstar-dark .pagination > li > a,
html.tstar-dark .pagination > li > span {
    background-color: #1c2128 !important;
    color: #d7dce2 !important;
    border-color: #333a44 !important;
}

html.tstar-dark .pagination > li > a:hover,
html.tstar-dark .pagination > li > a:focus {
    background-color: #2a313b !important;
    color: #ffffff !important;
}

html.tstar-dark .pagination > .active > a {
    background-color: #2d5d9c !important;
    border-color: #2d5d9c !important;
    color: #ffffff !important;
}

html.tstar-dark .nav-tabs > li > a {
    color: #99a2ac !important;
    background-color: #161a20 !important;
    border-color: #2a3038 !important;
}

html.tstar-dark .nav-tabs > li.active > a {
    background-color: #1f242c !important;
    color: #eef1f5 !important;
    border-color: #2a3038 #2a3038 transparent !important;
}

html.tstar-dark .tab-content {
    background-color: #1f242c !important;
}

html.tstar-dark .alert-info {
    background-color: #10293f !important;
    border-color: #1d4a70 !important;
    color: #a8ccf5 !important;
}

html.tstar-dark .alert-warning {
    background-color: #332a14 !important;
    border-color: #5c4a1d !important;
    color: #e8cf8a !important;
}

html.tstar-dark .alert-success {
    background-color: #12301f !important;
    border-color: #1e5536 !important;
    color: #9dd9b6 !important;
}

html.tstar-dark .alert-danger {
    background-color: #35171a !important;
    border-color: #6b2a2e !important;
    color: #f2a6a6 !important;
}

html.tstar-dark .progress {
    background-color: #232a33 !important;
}

html.tstar-dark .progress-bar {
    background-color: #2d5d9c !important;
}

html.tstar-dark .popover {
    background-color: #1f242c !important;
    border-color: #2a3038 !important;
    color: #d7dce2;
}

html.tstar-dark .popover-title {
    background-color: #1d222a !important;
    border-bottom-color: #2a3038 !important;
}

html.tstar-dark .popover.bottom > .arrow:after {
    border-bottom-color: #1f242c !important;
}

html.tstar-dark .tooltip-inner {
    background-color: #2a313b !important;
    color: #eef1f5 !important;
}

html.tstar-dark .tooltip.top .tooltip-arrow {
    border-top-color: #2a313b !important;
}

html.tstar-dark .tooltip.bottom .tooltip-arrow {
    border-bottom-color: #2a313b !important;
}

html.tstar-dark hr {
    border-top-color: #2a3038 !important;
}

html.tstar-dark .bg-white {
    background-color: #181c22 !important;
}

html.tstar-dark .page-header {
    border-bottom-color: #2a3038 !important;
}

/* ==========================================================================
   6. Homepage & section pages: cards, blocks, labels
   ========================================================================== */
html.tstar-dark #main-body-container,
html.tstar-dark #main-page-container,
html.tstar-dark .main-content {
    background-color: transparent !important;
}

html.tstar-dark .card,
html.tstar-dark .card-container,
html.tstar-dark .card-body,
html.tstar-dark .media {
    background-color: transparent !important;
}

html.tstar-dark .region-bg {
    background-color: #181c22 !important;
}

html.tstar-dark .tnt-headline,
html.tstar-dark .tnt-headline a,
html.tstar-dark .card-headline,
html.tstar-dark .card-headline a,
html.tstar-dark h1.headline,
html.tstar-dark h1.headline a,
html.tstar-dark .hammerHeadline h2,
html.tstar-dark .hammerHeadline h2 a {
    color: #eef1f5 !important;
}

html.tstar-dark .tnt-headline a:hover,
html.tstar-dark .card-headline a:hover,
html.tstar-dark h1.headline a:hover {
    color: #8abcf5 !important;
}

html.tstar-dark .tnt-summary,
html.tstar-dark .card-lead,
html.tstar-dark .card-intro {
    color: #aeb6c0 !important;
}

html.tstar-dark .card-meta,
html.tstar-dark .card-time-to-read,
html.tstar-dark .read-time,
html.tstar-dark .time-to-read-wrapper,
html.tstar-dark .tnt-byline-date,
html.tstar-dark .asset-date,
html.tstar-dark .type,
html.tstar-dark .the-type,
html.tstar-dark .nav-label {
    color: #99a2ac !important;
}

html.tstar-dark .block-title,
html.tstar-dark .block-title-inner,
html.tstar-dark .block-title-inner a,
html.tstar-dark .emphasis-h2,
html.tstar-dark .panel-title {
    color: #eef1f5 !important;
}

html.tstar-dark .card-labels .label,
html.tstar-dark .card-labels .tnt-flag {
    color: #f28b82 !important;
}

html.tstar-dark .type-of-work.has-type {
    background-color: #232a33 !important;
    color: #c9ced6 !important;
    border-color: #39414c !important;
}

html.tstar-dark .comboPack,
html.tstar-dark .gridStoryPack {
    border-color: #2a3038 !important;
}

html.tstar-dark .cp-border-top:before,
html.tstar-dark .comboPack .cp-border-top[data-pack]:before {
    border-bottom-color: #3a424d !important;
}

html.tstar-dark #main-page-container .custom-gridrow .fixed-col-left:after {
    background-color: #2a3038 !important;
}

/* "New from the Star" sidebar promo (site hard-codes #f8f8f8) */
html.tstar-dark #main-page-container .new-from.grid-nonstory-block {
    background: #171b21 !important;
}

html.tstar-dark #main-page-container .new-from.grid-nonstory-block .promoBox {
    border-top-color: #2a3038 !important;
}

html.tstar-dark #main-page-container .grid-nonstory-block article.card.promo.media p {
    color: #99a2ac !important;
}

/* block title variants that hard-code black text */
html.tstar-dark .blockTitleWithImage .block-title .block-title-inner h3,
html.tstar-dark .block-title h4,
html.tstar-dark .block-title.dark > .block-title-inner > *,
html.tstar-dark .block-title.dark > .block-title-inner > * > small,
html.tstar-dark .block-title.dark > .block-title-inner > * > a {
    color: #eef1f5 !important;
}

html.tstar-dark .block-overline.dark h5,
html.tstar-dark .block .calendar-time,
html.tstar-dark .block .calendar-time time {
    color: #99a2ac !important;
}

/* ==========================================================================
   7. Article pages
   ========================================================================== */
html.tstar-dark .tsArticle,
html.tstar-dark #asset-content,
html.tstar-dark .asset-body,
html.tstar-dark #article-body {
    background-color: transparent !important;
}

html.tstar-dark .asset-header h1,
html.tstar-dark .asset-header .headline {
    color: #f0f2f5 !important;
}

html.tstar-dark .asset-header .asset-summary p,
html.tstar-dark .subhead,
html.tstar-dark .tnt-subhead {
    color: #aab3bd !important;
}

html.tstar-dark .asset .tnt-byline,
html.tstar-dark .asset .tnt-date,
html.tstar-dark .asset .tnt-update-recent,
html.tstar-dark .authorList,
html.tstar-dark .asset-byline {
    color: #99a2ac !important;
}

html.tstar-dark .asset .tnt-byline a,
html.tstar-dark .asset-byline a,
html.tstar-dark .authorName a {
    color: #6fa8f0 !important;
}

html.tstar-dark .authorTitle {
    color: #7f8894 !important;
}

html.tstar-dark .asset .asset-body p {
    color: var(--body-text-color) !important;
}

html.tstar-dark #article-body blockquote > p {
    color: #c9ced6 !important;
}

html.tstar-dark #article-body > blockquote,
html.tstar-dark #article-body > div > blockquote {
    border-left-color: rgba(111, 168, 240, 0.45) !important;
}

html.tstar-dark blockquote {
    border-left-color: #3a424d !important;
    color: #c9ced6;
}

html.tstar-dark figcaption.caption,
html.tstar-dark .caption,
html.tstar-dark .caption-text,
html.tstar-dark .captionNew,
html.tstar-dark .asset .asset-body .caption p,
html.tstar-dark .credit {
    color: #99a2ac !important;
}

html.tstar-dark .subscriber-only-label {
    color: #d7dce2 !important;
    border-color: #6fa8f0 !important;
}

html.tstar-dark .inline-asset.inline-article.tnt-inline-presentation-short-summary {
    border-bottom-color: #2a3038 !important;
}

html.tstar-dark .tnt-tags a,
html.tstar-dark .tag-list a,
html.tstar-dark .tnt-tag-list a {
    background-color: #232a33 !important;
    color: #aeb6c0 !important;
    border-color: #39414c !important;
}

html.tstar-dark .articleFeedbackCTA,
html.tstar-dark .authorCard {
    background-color: #171b21 !important;
    border-color: #2a3038 !important;
    color: #d7dce2;
}

/* Editor "block background" cards ("More from the Star & partners",
   "More News", "Top Trending", ...). The homepage disables this style via
   its grid CSS; article pages keep it, so it must be darkened here. */
html.tstar-dark .tnt-has-block-bg {
    background-color: #171b21 !important;
    border-color: #2a3038 !important;
}

/* related-content boxes and inline related links */
html.tstar-dark .related-wrapper,
html.tstar-dark .tncms-inline-relcontent-bio,
html.tstar-dark .tncms-inline-relcontent-question,
html.tstar-dark .tncms-inline-relcontent-refer {
    background-color: #171b21 !important;
}

html.tstar-dark .related-wrapper {
    border-color: #2a3038 !important;
}

/* "Subscriber" label chips on hard-locked stories */
html.tstar-dark .preflag,
html.tstar-dark .preflagred {
    background-color: #232a33 !important;
    color: #d7dce2 !important;
}

html.tstar-dark .ovx-vertical-bg {
    background: #171b21 !important;
}

/* paywall / register promos */
html.tstar-dark .register-promo,
html.tstar-dark .user-promo-button,
html.tstar-dark .access-offers-in-page,
html.tstar-dark #paywall-container,
html.tstar-dark .paywall-container {
    background-color: #181c22 !important;
    color: #d7dce2 !important;
    border-color: #2a3038 !important;
}

/* gift-article dropdown */
html.tstar-dark #tnt-gift-menu .gift-title {
    background-color: rgba(255, 255, 255, 0.06) !important;
    border-bottom-color: #2a3038 !important;
}

html.tstar-dark #tnt-gift-menu .gift-options li {
    border-bottom-color: #2a3038 !important;
}

/* ==========================================================================
   8. Photos & media
   ========================================================================== */
html.tstar-dark .photo,
html.tstar-dark .image,
html.tstar-dark .card-image,
html.tstar-dark .photo.layout-horizontal.letterbox-style-white,
html.tstar-dark img.img-responsive.lazyload.full.white {
    background-color: #16191d !important;
}

html.tstar-dark .video-container,
html.tstar-dark .media-container {
    background-color: #000000 !important;
}

/* ==========================================================================
   9. Offcanvas mobile drawer
   ========================================================================== */
html.tstar-dark .offcanvas-drawer {
    background-color: #16191e !important;
    color: #d7dce2 !important;
}

html.tstar-dark .offcanvas-drawer .navbar-nav li a,
html.tstar-dark .offcanvas-drawer .panel-title a,
html.tstar-dark .offcanvas-drawer .dropdown ul li a {
    color: #d7dce2 !important;
}

html.tstar-dark .offcanvas-drawer .dropdown ul,
html.tstar-dark .offcanvas-drawer .panel ul {
    background-color: #1b1f25 !important;
}

html.tstar-dark .offcanvas-drawer .expand-children {
    background-color: #2a313b !important;
}

html.tstar-dark .offcanvas-drawer .expand-children.collapsed .tnt-svg {
    color: #6b7480 !important;
}

html.tstar-dark .nav-logo {
    background-color: #16191e !important;
}

/* ==========================================================================
   10. Footer & misc
   ========================================================================== */
html.tstar-dark #site-footer,
html.tstar-dark .site-footer {
    background-color: var(--footer-bg-color) !important;
    color: var(--footer-text-color) !important;
}

html.tstar-dark #site-footer a,
html.tstar-dark .site-footer a {
    color: #9db3d1 !important;
}

html.tstar-dark #site-copyright-container {
    background-color: #0a0c0e !important;
}

html.tstar-dark #site-copyright section {
    color: #8a93a0 !important;
}

html.tstar-dark .user-controls,
html.tstar-dark .header-user {
    background-color: transparent !important;
    color: #d7dce2 !important;
}

html.tstar-dark .user-controls a {
    color: #c9ced6 !important;
}

html.tstar-dark .tnt-ads-container,
html.tstar-dark .tnt-ads,
html.tstar-dark .dfp-ad {
    background-color: transparent !important;
}

html.tstar-dark .viafoura,
html.tstar-dark #vf-comments {
    background-color: transparent !important;
}
`;

    /* ------------------------------------------------------------------ */

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;

    // Keep our stylesheet the last child of <head> so that it wins cascade
    // ties against site stylesheets (including their !important rules) that
    // are added after this script runs.
    function placeLast() {
        const head = document.head;
        if (!head) return;
        if (style.parentNode !== head || style !== head.lastElementChild) {
            head.appendChild(style);
        }
    }

    if (document.head) {
        document.head.appendChild(style);
    } else {
        // document-start: <head> is not parsed yet. Attach to <html> so the
        // styles apply as early as possible; placeLast() will move it into
        // <head> as soon as <head> exists.
        document.documentElement.appendChild(style);
    }
    placeLast();

    const headObserver = new MutationObserver(placeLast);

    if (document.head) {
        headObserver.observe(document.head, { childList: true });
    } else {
        const rootObserver = new MutationObserver(function () {
            placeLast();
            if (document.head) {
                rootObserver.disconnect();
                headObserver.observe(document.head, { childList: true });
            }
        });
        rootObserver.observe(document.documentElement, { childList: true });
    }

    // Paint the root dark immediately (anti flash-of-white), before any
    // stylesheet has been parsed.
    document.documentElement.classList.add('tstar-dark');
    document.documentElement.style.backgroundColor = '#111418';
})();
