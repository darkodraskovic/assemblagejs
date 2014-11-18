function makeBackground(image, width, height) {
    var backgroundTexture = new PIXI.Texture.fromImage(image);
    var background = new PIXI.TilingSprite(backgroundTexture, width, height);

    background.position.x = 0;
    background.position.y = 0;

    return background;
}
