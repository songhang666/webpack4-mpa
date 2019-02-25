import '@/assets/js/flexible.js'
import './index.scss'
import '@/assets/css/normalize.css'
import $ from 'zepto'
import {unitObj} from "@/assets/js/util.js";

$(function () {
    let sc = unitObj.urlPara.getPara("sc"),
        allParas = unitObj.urlPara.getParaStr(),
        storage = window.localStorage,
        helpBtn = $('.help'),
        playBtn = $('.play');
    if (storage.sc === sc) {
        helpBtn.css(
            "background-image", "url('../../assets/image/already-relive.png')"
        );
    }
    helpBtn.on('click', function () {
        storage.setItem("sc", sc);
        $(this).css(
            "background-image", "url('../../assets/image/already-relive.png')"
        );
    });
    playBtn.on('click', function () {
        // window.location.href = 'index.html' + allParas;
        window.location.replace('index.html' + allParas);
    })
})