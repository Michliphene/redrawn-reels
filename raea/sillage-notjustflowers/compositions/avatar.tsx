/**
 * SILLAGE profile picture: the series' flacon alone, full of its note layers, on a plum stage. 1080×1080, no text
 * (a name is unreadable at 110 px). Render: raea render compositions/avatar.tsx --frame 0 -o out/avatar.png
 */
import { AbsoluteFill, Composition, registerRoot } from "raea";
import { Bloom, ToneMapping, manifold } from "raea/3d";
import { Cuboid, Cylinder, Mesh3d, Torus } from "raea/mesh";
import { Fog, StandardMaterial } from "raea/pbr";
import { AmbientLight, DirectionalLight, PointLight, SpotLight } from "raea/light";
import { Quat, Transform } from "raea/transform";
import { Camera3d } from "raea/camera";
import { LinearRgba, Srgba } from "raea/color";

const P = { bg: "#0C0609", stone: "#45283A", gold: "#D9B26A", glass: "#F4E9EE", accent: "#F4B6C2" };
const LAYERS = ["#F4B6C2", "#E9A0B6", "#EADBB0", "#E68FA8", "#C29A6B", "#93A86C"];
const glow = (hex: string, k: number) => LinearRgba.from(Srgba.hex(hex)).mul(k);
const PLINTH_TOP = 0.5, BOT = { w: 1.5, h: 2.0, d: 0.95 };
const BOT_Y = PLINTH_TOP + BOT.h / 2 + 0.01;
const INNER = { w: 1.16, d: 0.62, floor: PLINTH_TOP + 0.2, h: 1.55 };
const GLASS = manifold.roundedBox(BOT.w, BOT.h, BOT.d, 0.16);
const SHOULDER = manifold.roundedBox(0.62, 0.16, 0.5, 0.05);
const CAP = manifold.roundedBox(0.7, 0.62, 0.7, 0.07);
const PLINTH = manifold.roundedBox(2.6, PLINTH_TOP, 1.9, 0.08);

function Avatar() {
  const LH = INNER.h / LAYERS.length;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 46%, #4A2234 0%, #1E0D16 48%, ${P.bg} 78%)` }}>
      <Camera3d transform={Transform.fromXyz(0.85, 2.3, 8.3).lookingAt([0, 1.78, 0])} projection={{ Perspective: { fov: (34 * Math.PI) / 180 } }} />
      <ToneMapping mode="tony" exposure={0.35} />
      <Bloom intensity={0.35} threshold={0.85} />
      <AmbientLight brightness={150} color="#E8B4C8" />
      <DirectionalLight transform={Transform.fromXyz(-4, 8, 6).lookingAt([0, 1, 0])} illuminance={3200} color="#FFE9DC" />
      <SpotLight transform={Transform.fromXyz(1.5, 7, 4).lookingAt([0, 1.5, 0])} intensity={5200000} outer_angle={0.5} inner_angle={0.2} color="#FFF2E6" />
      <PointLight transform={Transform.fromXyz(-1.2, 2.6, -1.8)} intensity={1600000} color={P.accent} range={8} />
      <Fog color="#120810" near={9} far={22} />
      <Mesh3d name="floor" transform={Transform.fromXyz(0, -0.05, 0)}>
        <Cuboid half_size={[40, 0.05, 40]} />
        <StandardMaterial base_color="#170A10" perceptual_roughness={0.92} />
      </Mesh3d>
      <Mesh3d name="backdrop" transform={Transform.fromXyz(0, 6, -5)}>
        <Cuboid half_size={[40, 12, 0.05]} />
        <StandardMaterial base_color="#22101A" perceptual_roughness={0.95} />
      </Mesh3d>
      <SpotLight transform={Transform.fromXyz(0, 6, 0).lookingAt([0, 2.5, -5])} intensity={2600000} outer_angle={0.7} inner_angle={0.25} color="#F4B6C2" />
      <Mesh3d name="plinth" shape={PLINTH} transform={Transform.fromXyz(0, PLINTH_TOP / 2, 0)}>
        <StandardMaterial base_color={P.stone} perceptual_roughness={0.35} metallic={0.1} />
      </Mesh3d>
      <Mesh3d name="ring" allowOverlap transform={Transform.fromXyz(0, PLINTH_TOP + 0.01, 0).withRotation(Quat.fromEuler("XYZ", Math.PI / 2, 0, 0)).withScale([1.25, 1, 1])}>
        <Torus major_radius={1.05} minor_radius={0.025} />
        <StandardMaterial base_color={P.gold} emissive={glow(P.gold, 1.2)} />
      </Mesh3d>
      {LAYERS.map((c, i) => (
        <Mesh3d key={i} name={`juice-${i}`} allowOverlap transform={Transform.fromXyz(0, INNER.floor + i * LH + LH / 2, 0)}>
          <Cuboid half_size={[INNER.w / 2, LH / 2 - 0.003, INNER.d / 2]} />
          <StandardMaterial base_color={c} perceptual_roughness={0.15} emissive={glow(c, 0.55)} />
        </Mesh3d>
      ))}
      <Mesh3d name="glass" allowOverlap shape={GLASS} transform={Transform.fromXyz(0, BOT_Y, 0)}>
        <StandardMaterial base_color={P.glass} perceptual_roughness={0.04} specular_transmission={0.93} ior={1.2} thickness={0.04} reflectance={0.6} />
      </Mesh3d>
      <Mesh3d name="shoulder" allowOverlap shape={SHOULDER} transform={Transform.fromXyz(0, PLINTH_TOP + BOT.h + 0.07, 0)}>
        <StandardMaterial base_color={P.glass} perceptual_roughness={0.05} specular_transmission={0.9} ior={1.2} thickness={0.04} />
      </Mesh3d>
      <Mesh3d name="collar" allowOverlap transform={Transform.fromXyz(0, PLINTH_TOP + BOT.h + 0.21, 0)}>
        <Cylinder radius={0.2} half_height={0.08} />
        <StandardMaterial base_color={P.gold} perceptual_roughness={0.22} metallic={1} />
      </Mesh3d>
      <Mesh3d name="cap" allowOverlap shape={CAP} transform={Transform.fromXyz(0, PLINTH_TOP + BOT.h + 0.6, 0)}>
        <StandardMaterial base_color="#1A0C12" perceptual_roughness={0.18} metallic={0.2} clearcoat={1} clearcoat_perceptual_roughness={0.05} />
      </Mesh3d>
    </AbsoluteFill>
  );
}

registerRoot(() => <Composition id="avatar" component={Avatar} width={1080} height={1080} fps={30} durationInFrames={1} />);
