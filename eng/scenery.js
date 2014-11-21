function makeBackground(image, width, height) {
    var texture = new PIXI.Texture.fromImage(image);
    var background = new PIXI.TilingSprite(texture, width, height);

    background.position.x = 0;
    background.position.y = 0;

    return background;
}
