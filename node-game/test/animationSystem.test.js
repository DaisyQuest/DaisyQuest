import {
  createEffectTrack,
  createFrameCursor,
  createSpriteTrack
} from "../src/systems/animationSystem.js";

describe("animationSystem", () => {
  test("createSpriteTrack requires a baseSpriteId", () => {
    expect(() => createSpriteTrack()).toThrow("Sprite track requires a baseSpriteId.");
    expect(() => createSpriteTrack({})).toThrow("Sprite track requires a baseSpriteId.");
    expect(() => createSpriteTrack({ baseSpriteId: "   " })).toThrow(
      "Sprite track requires a baseSpriteId."
    );
    expect(() => createSpriteTrack({ baseSpriteId: 42, frameSequence: [{ durationMs: 50 }] }))
      .toThrow("Sprite track requires a baseSpriteId.");
  });

  test("createSpriteTrack requires a non-empty frame sequence", () => {
    expect(() =>
      createSpriteTrack({
        baseSpriteId: "hero_idle",
        frameSequence: []
      })
    ).toThrow("Sprite track requires a non-empty frameSequence.");
    expect(() =>
      createSpriteTrack({
        baseSpriteId: "hero_idle",
        frameSequence: "not-a-list"
      })
    ).toThrow("Sprite track requires a non-empty frameSequence.");
  });

  test("createSpriteTrack normalizes sprite frames", () => {
    const track = createSpriteTrack({
      baseSpriteId: "hero_idle",
      frameSequence: [
        {
          durationMs: -5
        },
        {
          durationMs: 160,
          overlayOps: ["glow"],
          tintOps: ["warm"],
          recolorOps: ["palette-shift"]
        },
        {
          durationMs: 75,
          overlayOps: "not-an-array",
          tintOps: null,
          recolorOps: {}
        },
        undefined
      ]
    });

    expect(track.trackType).toBe("sprite");
    expect(track.baseSpriteId).toBe("hero_idle");
    expect(track.frameSequence[0]).toEqual({
      durationMs: 100,
      overlayOps: [],
      tintOps: [],
      recolorOps: []
    });
    expect(track.frameSequence[1]).toEqual({
      durationMs: 160,
      overlayOps: ["glow"],
      tintOps: ["warm"],
      recolorOps: ["palette-shift"]
    });
    expect(track.frameSequence[2]).toEqual({
      durationMs: 75,
      overlayOps: [],
      tintOps: [],
      recolorOps: []
    });
    expect(track.frameSequence[3]).toEqual({
      durationMs: 100,
      overlayOps: [],
      tintOps: [],
      recolorOps: []
    });
  });

  test("createEffectTrack normalizes effect frames", () => {
    const track = createEffectTrack({
      frameSequence: [
        {
          durationMs: 120,
          globalOverlays: ["screen-shake"],
          cameraOps: ["zoom-in"]
        },
        {
          durationMs: 80
        },
        {
          durationMs: 75,
          globalOverlays: "spark",
          cameraOps: null
        },
        undefined
      ]
    });

    expect(track.trackType).toBe("effect");
    expect(track.frameSequence[0]).toEqual({
      durationMs: 120,
      globalOverlays: ["screen-shake"],
      cameraOps: ["zoom-in"]
    });
    expect(track.frameSequence[1]).toEqual({
      durationMs: 80,
      globalOverlays: [],
      cameraOps: []
    });
    expect(track.frameSequence[2]).toEqual({
      durationMs: 75,
      globalOverlays: [],
      cameraOps: []
    });
    expect(track.frameSequence[3]).toEqual({
      durationMs: 100,
      globalOverlays: [],
      cameraOps: []
    });
  });

  test("createEffectTrack requires frames", () => {
    expect(() => createEffectTrack()).toThrow("Effect track requires a non-empty frameSequence.");
    expect(() => createEffectTrack({ frameSequence: "not-a-list" }))
      .toThrow("Effect track requires a non-empty frameSequence.");
  });

  test("FrameCursor resolves looping sprite frames deterministically", () => {
    const track = createSpriteTrack({
      baseSpriteId: "hero_walk",
      frameSequence: [
        { durationMs: 100, overlayOps: ["trail"] },
        { durationMs: 200, tintOps: ["cool"] }
      ],
      loop: true
    });
    const cursor = createFrameCursor(track);

    const first = cursor.resolveFrameAt(250);
    expect(first.frameIndex).toBe(1);
    expect(first.elapsedMs).toBe(150);

    const looped = cursor.resolveFrameAt(350);
    expect(looped.frameIndex).toBe(0);
    expect(looped.elapsedMs).toBe(50);
  });

  test("FrameCursor clamps non-looping tracks and handles negative time", () => {
    const track = createEffectTrack({
      frameSequence: [
        { durationMs: 90, globalOverlays: ["tint-blue"] },
        { durationMs: 110, cameraOps: ["shake"] }
      ],
      loop: false
    });
    const cursor = createFrameCursor(track);

    const negative = cursor.resolveFrameAt(-20);
    expect(negative.frameIndex).toBe(0);

    const beyond = cursor.resolveFrameAt(500);
    expect(beyond.frameIndex).toBe(1);
    expect(beyond.elapsedMs).toBe(500 - 90);
  });

  test("FrameCursor treats non-numeric time as zero", () => {
    const track = createSpriteTrack({
      baseSpriteId: "hero_idle",
      frameSequence: [{ durationMs: 60 }]
    });
    const cursor = createFrameCursor(track);
    const resolved = cursor.resolveFrameAt(Number.NaN);
    expect(resolved.frameIndex).toBe(0);
    expect(resolved.elapsedMs).toBe(0);
  });

  test("FrameCursor defaults missing trackType to unknown", () => {
    const cursor = createFrameCursor({
      frameSequence: [{ durationMs: 40 }],
      loop: false
    });
    expect(cursor.trackType).toBe("unknown");
  });

  test("FrameCursor throws without a valid track", () => {
    expect(() => createFrameCursor()).toThrow("FrameCursor requires a track with frames.");
    expect(() => createFrameCursor({ frameSequence: [] })).toThrow(
      "FrameCursor requires a track with frames."
    );
  });
});
