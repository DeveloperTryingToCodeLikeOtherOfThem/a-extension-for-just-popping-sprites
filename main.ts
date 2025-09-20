interface SpriteLike2 {
    z: number;
    id: number;
    __draw(camera: scene.Camera): void;
}

class AhhSpritesAreHard implements SpriteLike2 {
    private _image: Image;

    x: number = 0;
    y: number = 0;

    _lastX: number;
    _lastY: number;

    id: number = 0;

    private _z: number

    get image(): Image {
        return this._image;
    }

    constructor(img: Image) {
        this.x = screen.width >> 1;
        this.y = screen.height >> 1;
        this._lastX = this.x;
        this._lastY = this.y;
        this.setImage(img)
    }

    setImage(img: Image) {
        if (!img) return; // don't break the sprite
        this._image = img;
    }

    get width() {
        return this._image.width
    }
   
    get height() {
        return this._image.height
    } 

    get left() {
        return this.x - (this.width >> 1)
    }
 
    set left(value: number) {
        this.x = value + (this.width >> 1);
    }
   
    get right() {
        return this.left + this.width
    }
   
    set right(value: number) {
        this.x = value - (this.width >> 1);
    }

    get top() {
        return this.y - (this.height >> 1)
    }

    set top(value: number) {
        this.y = value + (this.height >> 1);
    }
   
    get bottom() {
        return this.top + this.height
    }
   
    set bottom(value: number) {
        this.y = value - (this.height >> 1);
    }

    __draw(camera: scene.Camera) {
        if(this.isOutOfScreen(camera)) return;

        const l = this.left - camera.offsetX;
        const t = this.top - camera.offsetY;
        screen.drawTransparentImage(this._image, l, t)
    }

    isOutOfScreen(camera: scene.Camera): boolean {
        const ox = camera.offsetX;
        const oy = camera.offsetY;
        return this.right - ox < 0 || this.bottom - oy < 0 || this.left - ox > screen.width || this.top - oy > screen.height;
    }

    get z(): number {
        return this._z;
    }

    set z(value: number) {
        if (value != this._z) {
            this._z = value;
            new ExtraScene(control.eventContext()).flags |= 1;
        }
    }
} 

new AhhSpritesAreHard(img`
    ..........bbbbbb................
    .......bbb444444bb..............
    .....2244444ddd444b.............
    ....244444444dddd44e............
    ...244444444444ddd4be...........
    ..244444444444444d44be..........
    .2b444444444444444d4be..........
    .2b44444444444444444bbe.........
    2bbb4444444444444444bbe.........
    2bbb4444444444444444bbe.........
    2bb4b4444444444444444bbe........
    2bb4444444444444444444be........
    2bb44444444444444444444e........
    2bbb444bbb4444444444444e........
    22bbb444bb4bb444444444be........
    .2bbbbb44bbbb44444444bbe........
    .22bbbbbbbb44bbb444444bbe.......
    ..eeebbbbbbb44bbb444444be.......
    ...eeeeebbbbbbbb44b4444be.......
    .....eeeeee222bb44bbb4bbe.......
    .......eeeee222bb44bbbbee.......
    ............e222bbbbbbbec.......
    ..............ee2bbbbeebdb......
    .................eeeeecdddb.....
    .......................cd11bbbb.
    ........................cd111dbb
    .........................b11111c
    .........................c11dd1c
    .........................cd1dbc.
    .........................cb11c..
    ..........................ccc...
    ................................
`)

class ExtraScene {
    allSprites: SpriteLike2[]
    spriteNextId: number
    flags: number = 0;
    camera: scene.Camera

    constructor(public eventContext: control.EventContext) {
        this.camera = new scene.Camera()
        this.init()
        this.allSprites = []
    }

    addSprite(sprite: SpriteLike2) {
        this.allSprites.push(sprite);
        sprite.id = this.spriteNextId++;
    }

    init() {
        this.eventContext.registerFrameHandler(90, () => {
            control.enablePerfCounter("sprite_draw")
            if (this.flags & scene.Flag.NeedsSorting)
                this.allSprites.sort(function (a, b) { return a.z - b.z || a.id - b.id; })
            for (const s of this.allSprites)
                s.__draw(this.camera);
        })
    }
}

function addSpriteFinally(img: Image) {
    const scene = new ExtraScene(control.eventContext())
    const sprite = new AhhSpritesAreHard(img)
    scene.addSprite(sprite)
    return sprite
}
// controller.moveSprite(addSpriteFinally(assets.image`hi`))
