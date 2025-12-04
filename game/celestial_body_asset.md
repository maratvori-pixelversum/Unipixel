# ULTRA-DETAILED PIXELATED ISOMETRIC CELESTIAL BODY ASSET GENERATOR
## Comprehensive Master Prompt for AI Agent - Extended Edition

---

## CORE INSTRUCTION

Generate a unique, hyper-detailed, visually complex pixelated isometric 3D sphere asset representing a **[CELESTIAL BODY TYPE]**. Each asset must be completely distinct with no repetition of visual patterns, ensuring infinite variety across all generated celestial objects. Every single pixel must serve a deliberate purpose in creating depth, texture, atmospheric realism, and three-dimensional volumetric presence while maintaining authentic retro pixel art aesthetics.

---

## ADVANCED VISUAL STYLE REQUIREMENTS

### Comprehensive Pixel Art Aesthetic Framework

#### Pixel Grid Construction & Microscopic Visibility
- **Individual pixel clarity**: Each pixel must be clearly distinguishable with hard edges, no sub-pixel rendering, no interpolation smoothing
- **Grid alignment perfection**: All elements snap to base pixel grid with mathematical precision - no floating positions
- **Pixel cluster organization**: Group pixels in 2x2, 3x3, 4x4, 5x5, 6x6, or 8x8 blocks for macro-texture creation and pattern coherence
- **Resolution style hierarchy**: 16-bit era detail density (SNES/Genesis style with 256 colors), 32-bit refinement level (PS1/Saturn aesthetic with 16.7M colors), or hybrid approach combining both
- **Pixel weight distribution**: Balanced pixel density across entire visible surface—avoid sparse empty areas, maintain consistent visual interest in every region
- **Color bleeding prevention**: Hard pixel boundaries with no unintentional color mixing, no anti-aliasing artifacts from rendering engine
- **Pixel saturation depth levels**: Varied brightness within same hue family to create perceived depth (5-15 distinct shade variations per primary color)
- **Chromatic pixel separation**: Intentional single-pixel color offsets to simulate chromatic aberration at high-contrast edges (optional artistic choice for enhanced depth)
- **Edge pixel weight**: Outer silhouette pixels are slightly darker/lighter than interior to enhance shape definition
- **Pixel doubling**: Option to use 2x2 pixel blocks as single "macro-pixels" for authentic retro low-res aesthetic
- **Scanline simulation**: Optional horizontal 1-pixel dark lines every 2-4 pixels for CRT monitor effect
- **Color bit-depth limitation**: Restrict to 5-bit per channel (32 levels) or 6-bit per channel (64 levels) for authentic retro color crunching

#### Advanced Color Palette Architecture & Theory
- **Total color count**: 48-256 unique RGB values per asset using indexed palette approach (not full 24-bit color space)
- **Hue distribution strategy**: 
  - Primary hue family: 40-60% of palette (e.g., blues for water worlds)
  - Secondary hue family: 25-35% of palette (e.g., greens for vegetation)
  - Tertiary hue family: 10-20% of palette (e.g., browns for rocky terrain)
  - Accent complementary colors: 5-15% of palette (e.g., orange volcanic regions)
- **Saturation gradient mapping**: 
  - High saturation for directly lit areas (60-100% saturation)
  - Medium saturation for ambient lit regions (40-60%)
  - Desaturated for deep shadows (10-40%)
  - Near-grayscale for extreme distance/haze (5-15%)
- **Brightness/Value range**: Full spectrum from near-black (#0A0A0A, #121212) to near-white (#F5F5F5, #FAFAFA) with 8-24 intermediate luminosity steps
- **Color temperature zones**: 
  - Warm tones (red-orange-yellow, 2000K-4000K) for illuminated surfaces facing star
  - Neutral tones (white-cream-tan, 5000K-7000K) for ambient light areas
  - Cool tones (blue-cyan-purple, 8000K-20000K) for shadows and space-exposed regions
- **Atmospheric color transmission**: Objects behind atmospheric layers adopt wavelength-dependent color shifts:
  - Thin atmosphere: 5-10% blue-shift for distant features
  - Dense atmosphere: 15-30% yellow-orange shift simulating scattering
  - Dust/haze: Desaturation + warm tint (Mars-like effect)
- **Metallic surface color behavior**: 
  - High-contrast value jumps between highlights and base color (200-300% brightness difference)
  - Hue shift in reflections based on environment color
  - Sharper color transitions (less gradient, more stepped)
- **Organic material color variation**: 
  - Subtle hue rotation within surface regions to avoid flat color fields (±5-15° hue shift)
  - Color noise: Random ±1-2 shade variation per pixel cluster for natural texture
  - Mineral veining: Contrasting color streaks following surface topology
- **Emission glow colors**: 
  - Self-illuminated areas (lava, plasma, lightning, star surface) use additive bright pixels
  - Base emission color + 50-100% brightness boost + slight bloom
  - Multiple emission layers: hot core (yellow-white), middle zone (orange-red), cool edge (dark red-brown)
- **Shadow color complexity**: 
  - Shadows are never pure black or gray—always tinted with environment light
  - Space shadow: Deep blue-purple tint from cosmic background radiation
  - Near-star shadow: Warm brown-orange from reflected starlight
  - Multiple shadow colors when multiple light sources present

#### Pixel-Perfect Anti-Aliasing & Edge Refinement
- **Xiaolin Wu algorithm interpretation**: Weighted pixel placement at curve edges using strategic opacity/color variation
- **Stair-stepping optimization**: 
  - Analyze curve angle to determine optimal step frequency
  - 1-pixel protrusions every 3-5 pixels on gentle curves
  - 1-pixel protrusions every 1-2 pixels on steep curves
  - Create rhythm to steps—avoid random jagged appearance
- **Selective smoothing hierarchy**: 
  - Priority 1: Anti-alias major sphere outline (most visible edge)
  - Priority 2: Large crater rims and mountain silhouettes  
  - Priority 3: Cloud layer edges and atmospheric boundaries
  - Keep micro-details sharp and hard-edged (individual boulders, small craters)
- **Double-wide technique**: 
  - 2-pixel thick outlines with inner pixel lighter, outer pixel darker
  - Creates bold definition while maintaining pixel art aesthetic
  - Use on largest geographic features and sphere boundary
- **Rotated grid anti-aliasing**: 
  - Place transitional pixels at implied 45° angles using diagonal neighbor positions
  - Effective for diagonal lines and oblique crater walls
- **Hue-shifting AA method**: 
  - Instead of alpha blending, shift hue slightly at transition pixels
  - Example: Dark blue ocean meets light blue ice—transition pixel is cyan
  - Maintains hard pixel edges while reducing visual harshness
- **Contrast-based selective AA**: 
  - High-contrast edges (light rock against dark shadow) get maximum smoothing
  - Low-contrast edges (similar shades) stay sharp for efficiency
- **Directional bias technique**: 
  - Illuminate/sun-facing edges get more anti-aliasing and detail
  - Shadow/dark edges stay sharp and hard
  - Mimics natural perceptual focus on lit areas
- **Subpixel positioning simulation**: 
  - Use color averaging to simulate subpixel accuracy
  - Blend between two colors in specific ratios (25/75, 33/66, 50/50) to imply positions between pixels

### Isometric 3D Spherical Construction Mastery

#### Mathematical Isometric Precision & Geometry
- **Exact angle adherence**: 30° dimetric projection (technically 26.565° from horizontal for true isometric)
- **Pixel ratio enforcement**: 2:1 horizontal to vertical pixel ratio for all isometric elements (2 pixels horizontal = 1 pixel vertical rise)
- **Vanishing point elimination**: True isometric has no perspective convergence—all parallel lines remain perfectly parallel regardless of distance
- **Tile grid foundation**: Construct sphere on hexagonal or diamond isometric tile grid for authentic game asset compatibility
- **Scale consistency protocol**: Maintain identical pixel-per-unit ratio across all assets in a collection (e.g., 10 pixels = 1000km consistently)
- **Axis visual differentiation (optional)**: 
  - Subtle tint variation for different sphere faces (top slightly warmer, sides cooler)
  - Enhances 3D readability without breaking isometric rules
- **Shadow projection**: Cast shadows follow isometric angle rules (same 30° angle, stretched 2:1)
- **Multi-body isometric alignment**: When generating multiple objects (planet + moons), maintain consistent isometric plane

#### Advanced Spherical Surface Pixel Mapping Mathematics
- **Latitude ring construction algorithm**: Build sphere using horizontal pixel rings of progressively varying widths based on spherical geometry
  - Equator (0°): Maximum width - 200 pixels diameter (example scale)
  - 10° latitude: 196.96 pixels (cos 10°)
  - 15° latitude: 193.18 pixels (cos 15°)
  - 20° latitude: 187.94 pixels (cos 20°)
  - 30° latitude: 173.20 pixels (cos 30°)
  - 40° latitude: 153.20 pixels (cos 40°)
  - 45° latitude: 141.42 pixels (cos 45°)
  - 50° latitude: 128.56 pixels (cos 50°)
  - 60° latitude: 100.00 pixels (cos 60°)
  - 70° latitude: 68.40 pixels (cos 70°)
  - 75° latitude: 51.76 pixels (cos 75°)
  - 80° latitude: 34.73 pixels (cos 80°)
  - 85° latitude: 17.45 pixels (cos 85°)
  - Poles (90°): Single pixel cluster (3-9 pixels grouped)

- **Pixel ring staggering & offset**: 
  - Horizontally offset each latitude ring by 0.33-1 pixel to create smooth circular appearance
  - Alternating offset direction (left/right) prevents drift
  - Use sub-pixel color blending to achieve fractional offsets

- **Elliptical distortion for isometric**: 
  - Isometric spheres appear slightly elliptical from viewing angle
  - Vertical compression: 86.6% of true circle height (multiply by √3/2)
  - Horizontal dimension remains 100%

- **Foreshortening effect implementation**: 
  - Features near sphere limbs (edges) compressed to 40-70% of their equatorial size
  - Progressive compression: Linear scaling from equator (100%) to limb (50%)
  - Crater circles become ellipses near edges
  - Mountains appear shorter and compressed near horizon

- **Polar convergence mapping**: 
  - All longitude lines converge at poles using calculated pixel stepping
  - Create triangular pixel clusters at poles rather than attempting single-pixel points
  - Polar region detail must be extremely fine (2-4 pixel features maximum)

- **Surface texture flow topology**: 
  - Dither patterns bend and follow spherical curvature
  - Cloud bands follow latitude lines (parallel to equator)
  - Impact ejecta rays curve with sphere surface
  - Tectonic features follow great circle paths

- **Equatorial bulge (oblate spheroid)**: 
  - For rapidly rotating planets: Equator 2-5% wider diameter than polar diameter
  - Smooth transition from equatorial maximum to polar minimum
  - Affects latitude ring calculations (use ellipse formula rather than circle)

- **Tidal locking deformation**: 
  - Elongation toward parent body (egg-shaped)
  - 1-3% diameter increase on near side, decrease on far side
  - Subtle—most visible in moons of gas giants

#### Multi-Layer Depth Architecture (10-Layer System)

**Layer 1 - Foundation Sphere Geometry**
- Pure geometric form: Perfect pixel circle using Midpoint Circle Algorithm
- Solid base color (#base_color) filling entire sphere interior
- No shading, no detail—establishes shape only
- Edge pixels precisely calculated for smooth curvature
- Background transparency (alpha = 0) outside sphere boundary

**Layer 2 - Primary Topographic Base Map**
- Major geographic divisions: continents, ocean basins, ice caps, impact basins
- Color coding by terrain type:
  - Ocean: Deep blues (#0A2351 to #1E5A8E)
  - Land: Earth tones (#8B7355 to #D4B896)
  - Ice: Bright whites and blues (#E8F4F8 to #FFFFFF)
  - Volcanic: Dark grays to blacks (#2C2C2C to #505050)
- No elevation detail yet—flat color regions
- Follows latitude/longitude grid distortion from spherical mapping
- Continental shapes follow fractal coastline generation (detail at multiple scales)

**Layer 3 - Elevation Mapping & Height Data**
- Height represented through pixel displacement AND color shift:
  - Mountains: +2 to +6 pixels vertical displacement, lighter color (snow caps)
  - Hills: +1 to +2 pixels displacement, slightly lighter shade
  - Valleys: -1 to -2 pixels displacement, slightly darker shade
  - Deep trenches: -2 to -4 pixels displacement, darkest shade
- Create shadow casting: Tall features cast pixel shadows on adjacent lower terrain
- Elevation contour lines: Subtle 1-pixel lines every 500m elevation (optional detail)
- Hypsometric tinting: Color changes with elevation (green lowlands, brown highlands, white peaks)

**Layer 4 - Secondary Geographic Features**
- Crater fields: Circular depressions with raised rims (10-50 pixel diameter)
  - Outer ejecta blanket (lighter pixels radiating outward)
  - Raised rim (ring of lighter pixels)
  - Interior floor (darker pixels)
  - Central peak (light pixel cluster in center of large craters)
  - Ray systems (bright streaks extending hundreds of pixels)
- Valley networks: Dendritic branching patterns (dark pixel lines 2-4 pixels wide)
- Ridge systems: Mountain chains (bright pixel lines 3-8 pixels wide)
- Volcanic calderas: Circular dark zones with surrounding lava flows
- Fault scarps: Linear cliffs (sharp color transitions with shadow side)
- Dune fields: Repetitive wave patterns (alternating light/dark stripes)

**Layer 5 - Micro-Detail Surface Texturing**
- Individual boulders: 2-8 pixel clusters with highlight and shadow pixels
- Small craterlets: 3-12 pixel circles dotting surface
- Surface roughness: Pixel noise pattern (±1 shade variation randomly distributed)
- Granular materials:
  - Sand: Fine dither pattern (checkerboard or ordered dithering)
  - Gravel: Coarser dither with larger pixel clusters
  - Dust: Very fine noise, minimal contrast
  - Ice crystals: Bright single-pixel sparkles scattered randomly
- Rock texture: Irregular pixel clusters mimicking polygonal rock faces
- Erosion patterns: Smooth gradient transitions vs. sharp fresh features
- Weathering: Softened edges on old craters, sharp edges on recent impacts

**Layer 6 - Lower Atmospheric Layer (If Applicable)**
- Cloud base layer positioned 3-8 pixels above surface (use slight z-offset)
- Opacity: 10-50% depending on atmosphere thickness
- Cloud types:
  - Cumulus: Puffy individual pixel clusters (20-60 pixels wide)
  - Stratus: Flat horizontal pixel bands (full latitude width)
  - Cirrus: Wispy thin streaks (2-5 pixels wide, high opacity variation)
- Cloud texture: Cotton-like dithering pattern (soft edges using gradient dithering)
- Cloud shadows: Darker pixels cast onto surface directly below clouds
- Follows sphere curvature: Clouds appear compressed near limb
- Color tinting: Clouds adopt atmospheric color (white on Earth, yellow-brown on Venus, pink on Mars)

**Layer 7 - Upper Atmospheric Effects Layer**
- High-altitude phenomena positioned 5-15 pixels above surface
- Aurora borealis/australis:
  - Vertical curtain-like pixel patterns near poles
  - Green, pink, purple colors (#00FF88, #FF69B4, #9D4EDD)
  - 20-40% opacity with gradient fading
  - Wavy, flowing patterns (use sine wave displacement)
- Airglow: Subtle colored halo at sphere limb (1-3 pixel width)
- Noctilucent clouds: Extremely high, bright wispy features near terminator
- Upper storm systems: Large-scale circulation features (Jupiter's Great Red Spot)
- Less conforming to surface curvature—more diffuse and extended

**Layer 8 - Primary Lighting & Shadow Pass**
- **Specular highlights** (reflective surfaces):
  - Polar ice caps: Bright white pixel clusters (2-10 pixels) at maximum light angle
  - Water/liquid bodies: Linear highlight streaks following surface curve
  - Metallic surfaces: Sharp, high-contrast bright spots (200-300% brightness)
  - Size based on surface roughness: Larger highlights on smooth surfaces, tiny on rough

- **Form shadows** (sphere self-shadowing):
  - Terminator zone: Gradual transition from day to night (20-60 pixel width gradient)
  - Crescent phase: Large portion in shadow if light source is offset
  - Shadow gradient: Smooth dithered transition through 5-8 brightness levels

- **Cast shadows** (features shadowing other features):
  - Mountain shadows: Dark pixel streaks cast onto lower terrain at light angle
  - Cloud shadows: Diffuse darkening on surface below clouds
  - Ring shadows: Parallel dark bands cast onto planet surface from ring system
  - Shadow sharpness: Crisp near casting object, softer with distance

- **Ambient occlusion**:
  - Crevices: Always darker regardless of lighting (+20-40% darkness)
  - Crater interiors: Deep shadows with limited light bounce
  - Under overhangs: Near-black pixels (90% darkness)
  - Pole regions: Reduced lighting due to glancing angle

- **Terminator gradient characteristics**:
  - Width varies by atmosphere: No atmosphere = sharp (10 pixels), thick atmosphere = wide (80+ pixels)
  - Color shift in terminator: Orange-red tones at boundary from scattering
  - Ashen light: Faint illumination in shadow region from light reflection off nearby bodies

**Layer 9 - Atmospheric Light Scattering & Limb Effects**
- **Rayleigh scattering simulation**:
  - Blue-shift at atmosphere edges when viewed against space
  - Color shift intensity based on atmosphere thickness (5-25% color overlay)
  - Gradient from surface color to scattered color across 10-30 pixels

- **Limb darkening** (for stars and some planets):
  - Surface appears darker at edges than center
  - Gradual darkening across outer 20-30% of radius
  - Simulate less light reaching observer from oblique viewing angles

- **Limb brightening** (for atmospheres):
  - Bright rim around sphere where looking through maximum atmospheric thickness
  - 1-5 pixel width glowing edge
  - Color: Sky blue, reddish-orange, or atmospheric dominant color
  - Intensity: 30-80% brightness increase at very edge

- **Atmospheric glow extension**:
  - Soft pixel halo extending 2-15 pixels beyond physical sphere boundary
  - Opacity falloff: 40% at sphere edge to 0% at outer extent
  - Additive blending mode for glow (lighten only, don't darken)
  - Color based on atmospheric composition (oxygen = blue, methane = cyan, sulfur = yellow)

- **Subsurface scattering** (translucent materials):
  - Ice shells: Internal glow visible at edges (sphere limb glows subtly)
  - Thin atmosphere: Limb appears slightly lighter and warmer-toned
  - Implementation: Add 10-30% brightness to pixels within 15-40 pixels of limb

**Layer 10 - Dynamic Special Effects & Phenomena**
- **Lightning strikes**:
  - Bright jagged pixel lines (1-2 pixels wide, 10-40 pixels long)
  - Branching fractal pattern
  - White core (#FFFFFF) with colored glow (#4444FF for blue lightning)
  - Flash duration (if animated): 1-3 frames
  - Illuminate nearby clouds (brighten 20-pixel radius)

- **Volcanic activity**:
  - Lava flows: Bright orange-yellow pixel rivers (#FF4400 to #FFFF00)
  - Emission glow: 3-8 pixel radius glow around lava
  - Pyroclastic plumes: Dark gray particle streams erupting upward
  - Caldera glow: Bright pixel cluster at volcanic vent

- **Geyser plumes** (cryovolcanic):
  - Narrow vertical pixel streams (2-5 pixels wide, 30-100 pixels tall)
  - White/cyan color (#E0FFFF)
  - Particle dispersion at top (fan out into space)
  - Shadow cast on surface if backlit

- **Solar/stellar phenomena** (for stars):
  - Prominences: Arcing plasma loops extending from surface (red-orange #FF3300)
  - Solar flares: Sudden bright pixel burst areas (500% brightness)
  - Coronal loops: Magnetic field line visualizations
  - Sunspots: Dark circular regions (40-60% darker than surface)

- **Accretion effects** (black holes, active stars):
  - Particle streams: Pixel trails spiraling inward toward center
  - Doppler color shift: Blue approaching, red receding
  - Disk turbulence: Swirling pixel vortex patterns
  - Relativistic jets: Narrow bright pixel beams from poles (purple-blue)

- **Impact events** (if animated):
  - Bright flash at impact point (expanding 3-20 pixels over 5 frames)
  - Ejecta cone: Pixel particles radiating outward in cone shape
  - Crater formation: Darkening and displacement of pixels at impact site

- **Magnetic field visualization**:
  - Aurora: Covered in Layer 7, but intensified here as special effect
  - Magnetosphere: Subtle colored glow (green-cyan) forming oval around planet
  - Van Allen belts: Toroidal glow zones around magnetic equator

**Layer 11 - Post-Processing & Final Enhancement**
- **Outer atmospheric halo** (final pass):
  - Soft gradient glow 1-20 pixel radius beyond sphere
  - Extremely low opacity (5-20%) with exponential falloff
  - Additive blend mode only (no darkening)
  - Color matches atmospheric composition

- **Bloom effect** (for bright light sources):
  - Stars, lava, plasma: Expand bright pixels by 1-4 pixels radius
  - Brightness falloff: 100% at source, 0% at extent
  - Cross-shaped bloom pattern (4-directional glow) for intense sources

- **Chromatic aberration** (optional artistic effect):
  - Separate red/green/blue channels slightly (1-2 pixel offset)
  - Most visible at high-contrast edges (sphere silhouette)
  - Red channel offset +1 pixel horizontal, blue channel offset -1 pixel

- **Vignette** (optional):
  - Subtle darkening at canvas corners (5-15% darkness)
  - Focuses attention on central celestial body
  - Radial gradient from center to edges

- **Color grading pass**:
  - Adjust global color temperature (warmer/cooler)
  - Slight saturation boost for atmospheric regions (+5-10%)
  - Contrast enhancement for surface features (+10-15%)

- **Depth of field simulation** (optional, if multiple bodies):
  - Foreground objects: Full sharpness, high contrast
  - Mid-ground (main subject): Sharp
  - Background objects: Slight blur via color averaging (reduce detail), reduced contrast (-20%)

#### Volumetric Shading Pixel Techniques

**Cell Shading Method - Multi-Zone Approach**
Divide visible sphere surface into 5-9 distinct brightness zones with calculated transitions:

- **Zone 1 - Maximum Direct Illumination** (0-25° angle from light vector):
  - Brightness: 100% of base color luminosity
  - Saturation: Maximum (90-100%)
  - Coverage: 15-25% of visible hemisphere
  - Location: Center of illuminated side

- **Zone 2 - Strong Lighting** (25-40° angle):
  - Brightness: 75-90% of base color
  - Saturation: High (80-95%)
  - Coverage: 20-30% of visible hemisphere
  - Transition: Hard edge or 2-4 pixel dithered transition to Zone 1

- **Zone 3 - Moderate Lighting** (40-60° angle):
  - Brightness: 55-75% of base color
  - Saturation: Medium (60-80%)
  - Coverage: 25-35% of visible hemisphere
  - Transition: 4-8 pixel dithered gradient from Zone 2

- **Zone 4 - Grazing Light** (60-75° angle):
  - Brightness: 35-55% of base color
  - Saturation: Medium-low (40-65%)
  - Coverage: 15-25% of visible hemisphere
  - Transition: 6-10 pixel gradient, more pronounced dithering

- **Zone 5 - Terminator Region** (75-90° angle):
  - Brightness: 20-35% of base color
  - Saturation: Low (25-45%)
  - Coverage: 10-15% of visible hemisphere
  - Transition: 10-20 pixel wide gradient zone

- **Zone 6 - Core Shadow** (90-130° angle, surface facing away):
  - Brightness: 10-20% of base color
  - Saturation: Very low (15-30%), color-tinted toward environment
  - Coverage: 30-40% of visible hemisphere
  - Color shift: +10-20° hue toward blue (space) or orange (nearby star)

- **Zone 7 - Deep Shadow** (130-160° angle):
  - Brightness: 5-12% of base color
  - Saturation: Minimal (5-20%)
  - Coverage: 15-25% of visible hemisphere
  - Ambient light only: Subtle illumination from space background

- **Zone 8 - Occlusion Shadow** (160-180° angle, extreme far side):
  - Brightness: 2-8% of base color
  - Saturation: Near-zero (desaturated to 5-10%)
  - Coverage: 5-10% of visible hemisphere (only visible as edge)
  - Darkest pixels on entire sphere

- **Zone 9 (Optional) - Rim Light** (175-180° angle):
  - Secondary light source or reflected light from space/nearby body
  - Brightness: 15-40% boost to Zone 7-8 pixels
  - Thin highlight: 2-8 pixel width at sphere edge
  - Color: Contrasting color from main light (blue rim if main light is orange)

**Gradient Banding Technique**
- Create smooth lighting using parallel pixel bands transitioning from light to shadow
- Band structure: 8-16 horizontal pixel bands across hemisphere
- Each band: Consistent brightness level, creates "stepped" appearance
- Band width: Wider bands near equator (30-60 pixels), narrower at poles (5-15 pixels)
- Dithering between bands: Use 2-4 pixel dithered transition zones to soften steps

**Dithered Gradient Method**
- Blend between discrete cell-shaded zones using strategic dithering patterns:
  - Ordered dithering: Bayer 4x4 or 8x8 matrix for smooth gradients
  - Checkerboard dithering: Alternating pixels for 50/50 mix
  - Random dithering: Scattered pixels at zone boundaries (25/75, 50/50, 75/25 ratios)
  - Pattern dithering: Repeating geometric motifs (dots, lines, crosshatch)
- Dither zone width: 2-12 pixels depending on detail level

**Form-Following Shadow Casting**
- Shadows conform to and enhance geographic features:
  - Mountain range casts shadow into adjacent valley (dark pixel cluster oriented away from light)
  - Crater rim casts shadow onto interior floor (half-circle of darkness)
  - Cloud layer casts diffuse shadow onto surface below (20-40% darkening, soft edges)
  - Ring system casts parallel band shadows across planet surface (sharp-edged stripes)
- Shadow length calculation: Based on feature height and light angle
  - Height / tan(light_angle) = shadow length in pixels
- Shadow softness: Crisp near feature (1-2 pixels), softer with distance (blend over 3-8 pixels)

**Subsurface Scattering Zones**
- Translucent materials allow internal light transmission:
  - Ice shells: Edges appear brighter and warmer-toned (add 20-40% brightness, shift +10° hue toward orange)
  - Thin atmospheres: Limb brightening effect (glow extends 3-10 pixels beyond surface)
  - Clouds: Internal illumination makes thinner areas brighter
- Implementation: Add conditional brightness to pixels within X distance of limb/edge
- Color warmth: Scattered light becomes warmer (longer wavelengths penetrate better)

**Ambient Occlusion Mapping**
- Darkening in crevices and recessed areas regardless of main light source:
  - Crater interiors: Base darkness +30-60% (minimum light threshold)
  - Valley floors: +15-35% darkness
  - Under overhangs: +40-80% darkness
  - Between boulder clusters: +10-25% darkness
- Occlusion radius: Darkness based on how "enclosed" the pixel is
  - Trace rays in hemisphere above surface point
  - More blocked rays = darker pixel
- Always affects shadows more than highlights (don't darken bright areas as much)

**Fresnel Effect Simulation**
- Materials appear more reflective at glancing angles:
  - Water/ice: Minimal reflection when viewed from above (5-15%), strong at edges (60-90%)
  - Metallic surfaces: Always highly reflective but stronger at edges (+20-40%)
  - Rock: Slight increased brightness at limb (+5-15%)
- Implementation: Boost brightness/saturation for pixels in outer 20-40% of sphere radius
- Rim highlighting: 1-4 pixel bright outline at sphere silhouette edge

**Multi-Light Source Shading** (if multiple suns/stars)
- Additive lighting: Each light source contributes independently
- Color blending: Combine light colors (blue star + orange star = white-ish blend)
- Shadow complexity: Multiple shadows from single objects (one per light source)
- Balanced brightness: Primary light at 100%, secondary at 30-60%

---

## SURFACE DETAIL SPECIFICATIONS - ULTRA-DETAILED

### Hyper-Granular Geographic Features (Maximum Visible Detail)

#### Impact Crater Construction (Multi-Scale Detail)
**Large Complex Craters (60-150 pixel diameter):**
- Outer ejecta blanket: Rough textured region extending 1.5-3x crater diameter
  - Radial texture pattern: Pixels aligned in rays emanating from center
  - Brightness: 10-25% lighter than surrounding terrain
  - Scattered boulders: 2-6 pixel clusters dotting ejecta field
  - Ray systems: 2-4 pixel wide bright streaks extending 200-500 pixels
- Raised rim structure: 2-6 pixel height elevation
  - Inner slope (toward crater): 30-40° angle, terraced appearance (stepped pixels)
  - Outer slope: Gentler 10-20° angle, smoother gradient
  - Rim width: 10-20% of crater diameter
  - Color: 15-30% brighter than floor due to exposed fresher material
- Wall terracing: Concentric step patterns inside rim
  - 3-7 distinct terrace levels
  - Each terrace: 1-2 pixel height drop
  - Creates "staircase" appearance in cross-section
- Central peak complex: Mountain cluster at crater center
  - Height: 15-35% of crater depth
  - Composed of: 3-12 individual peak pixels arranged in cluster
  - Base diameter: 20-40% of crater diameter
  - Material: Uplifted mantle rocks (different color than surrounding terrain)
- Floor characteristics:
  - Flat floor: Dark pixels (20-40% darker than surroundings)
  - Possible lava flooding: Smooth texture, slightly lighter
  - Impact melt pools: Very smooth regions with subtle flow patterns
  - Floor fractures: Linear dark lines (1-2 pixels) creating polygonal patterns

**Medium Simple Craters (20-60 pixel diameter):**
- Bowl-shaped profile: Smooth continuous curve from rim to floor
  - No central peak or terracing
  - Even gradient shading from rim (light) to floor (dark)
- Rim height: 1-3 pixels above surroundings
- Floor depth: 2-5 pixels below surroundings
- Sharp rim definition: 1-pixel bright ring at crest
- Shadow side: Dark pixels on rim face away from light source

**Small Simple Craters (5-20 pixel diameter):**
- Circular depression: 3-12 pixel diameter
- Minimal rim structure: 1 pixel brightness increase
- Dark floor: 1-3 pixels darker than surroundings
- Cast shadow: 1-2 pixel dark region on shadow side of rim
- Clustered in groups: "crater chains" from secondary impacts

**Microcraters (2-5 pixel diameter):**
- Tiny circular dark spots
- No visible rim detail at this scale
- Scattered across surface adding texture
- Density: 10-50 per 100x100 pixel area on old surfaces

**Overlapping Crater Complexes:**
- Stratigraphic relationships: Newer craters cut through older ones
- Partial rim preservation: Older crater rim visible inside newer crater
- Age dating via superposition: More overlaps = older surface
- Saturation zones: Areas with so many craters, no original surface visible

#### Mountain Range Systems (Peak-to-Valley Complexity)
**Major Mountain Chains (100-400 pixel length):**
- Linear or arcuate arrangement of peaks
- Peak spacing: 15-40 pixels between summits
- Peak height variation: Tallest peaks 3-8 pixels above base, others 1-5 pixels
- Ridge crest line: Continuous 1-2 pixel bright line connecting peaks
- Valley systems between ranges: 2-6 pixel wide dark linear features

**Individual Mountain Peaks:**
- Triangular or pyramidal pixel construction
- Summit: 1-4 pixel bright cluster (snow cap or bare rock)
- Upper slopes: Lighter shade (exposed rock, less vegetation/dust)
- Middle slopes: Medium shade with texture variation
- Base/foothills: Darker, smoother transition to plains
- Shadowed face: 40-60% darker than lit face
- Talus slopes: Triangular dark regions at base (rock debris)

**Valley Network Features:**
- V-shaped valleys: Pointed bottom, steep walls
- U-shaped valleys: Flat floor, gentler walls (glacial origin)
- Valley width: 3-15 pixels
- Depth: 1-4 pixels darker than surroundings
- Tributary valleys: Smaller valleys feeding into main valley
- Dendritic patterns: Tree-like branching structure
- Sinuosity: Gentle curves following topographic lows

**Volcanic Mountain Types:**
- Shield volcanoes: Broad, gentle slopes (5-10° angle)
  - Large base: 60-120 pixel diameter
  - Low height: 2-4 pixels elevation
  - Summit caldera: Circular dark depression (10-25 pixels)
- Stratovolcanoes: Steep conical form
  - Smaller base: 30-60 pixels
  - Greater height: 4-8 pixels
  - Layered appearance: Alternating color bands (lava/ash layers)
- Volcanic domes: Rounded steep-sided mounds
  - Circular base: 20-40 pixels
  - Height: 2-4 pixels
  - Smooth texture: Minimal surface detail

#### Canyon & Rift Systems (Tectonic Features)
**Major Rift Valleys:**
- Length: 150-600 pixels (can wrap around entire hemisphere)
- Width: 15-60 pixels
- Depth: 3-7 pixels below surface (represented by darkening)
- Parallel walls: Straight or slightly curved edges
- Wall structure:
  - Fault scarps: Sharp linear cliffs (1 pixel bright/dark contrast)
  - Layered strata: Horizontal pixel bands showing rock layers
  - Mass wasting: Triangular darkened regions (landslide debris)
- Floor characteristics:
  - Flat floor: Smooth dark pixels
  - Floor fractures: Network of dark lines (1-2 pixels wide)
  - Possible lava flooding: Slightly lighter, very smooth regions

**Branching Canyon Networks:**
- Main trunk canyon: 15-40 pixels wide, hundreds of pixels long
- Tributary canyons: 5-15 pixels wide, branching at 45-75° angles
- Dendritic pattern: Tree-like erosional structure
- Increasing depth downstream: Canyons deepen toward outlet
- Headward erosion: Blunt canyon heads with amphitheater shapes

**Box Canyons & Mesas:**
- Flat-topped plateaus (mesas): 40-100 pixel diameter, 2-5 pixels higher than surroundings
- Vertical cliff edges: Sharp 1-pixel transition from top to slope
- Mesa cap rock: Resistant layer forming flat top
- Talus slopes: Dark triangular regions at cliff base

#### Plains, Plateaus & Basin Structures
**Vast Smooth Plains:**
- Minimal topographic variation: Flat color fields (100-400 pixel extent)
- Subtle texture: Very fine dithering pattern suggesting dust/regolith
- Possible features:
  - Wrinkle ridges: Low sinuous ridges (1-2 pixels bright, 5-15 pixels wide)
  - Ghost craters: Barely visible circular outlines (5% brightness difference)
  - Small craterlets: Scattered tiny impacts adding texture

**Elevated Plateaus:**
- Flat elevated regions: 50-150 pixel extent, 2-4 pixels above surroundings
- Boundary: Distinct escarpment (cliff edge)
- Surface: Smooth or lightly cratered
- Color: May differ from lowlands (different rock type/age)

**Impact Basins (Multi-Ring Structures):**
- Largest features: 200-500 pixel diameter
- Central basin floor: Dark, smooth, possibly lava-flooded
- Multiple concentric rings: 3-7 rings total
  - Ring spacing: Each ring 20-40% larger radius than previous
  - Ring structure: 1-2 pixel bright lines or subtle elevation steps
  - Outer ring fragmented: Partially preserved rim
- Radial texture: Grooves and ridges radiating from basin center

### Advanced Material & Composition Texturing

#### Rocky Surface Variants
**Bare Bedrock Regions:**
- Fractured appearance: Network of 1-pixel dark lines (fractures)
- Polygonal pattern: Fractures intersect forming irregular polygons (10-30 pixels across)
- Color variation: 2-4 shades showing different rock types/layers
- Blocky texture: Hard-edged pixel clusters (no soft gradients)
- Brightness variation: Random ±10-20% brightness per polygon

**Weathered/Eroded Rock:**
- Smoother texture: Less contrast between features
- Rounded edges: Gradual transitions instead of sharp
- Color: Often more uniform (dust/oxidation coating)
- Softer dithering patterns: Gentler texture appearance

**Boulder Fields:**
- Individual boulders: 3-10 pixel clusters
- Random distribution: Scattered with occasional groupings
- Size variation: Power-law distribution (many small, few large)
- Shadow casting: Each boulder has 1-2 pixel shadow
- Highlight: Sunlit face gets 1-2 bright pixels
- Concentration: Higher density at crater ejecta, landslide deposits

#### Metallic Surface Characteristics
**Iron-Nickel Metal (M-Type Asteroids):**
- High reflectivity: Bright overall appearance (70-90% brightness)
- Specular highlights: Sharp bright pixel clusters (3-8 pixels) at optimal reflection angle
- Limited color: Gray to silver tones (#A0A0A0 to #DCDCDC)
- High contrast: 200-400% difference between highlights and shadows
- Smooth texture: Less granular detail than rocky surfaces

**Oxidized Metal (Rusted Iron):**
- Red-orange coloration (#B7410E to #CD5C5C)
- Matte finish: Lower reflectivity than bare metal
- Gradual color transition zones: Weathering fronts where oxidation spreading
- Texture: Slightly rough, fine-grain dithering

#### Ice Formation Details
**Surface Ice (Polar Caps, Glaciers):**
- Bright white to pale blue (#F0FFFF to #FFFFFF)
- High albedo: Reflective, bright pixels even in shadow
- Texture variations:
  - Smooth young ice: Minimal texture, nearly solid color
  - Fractured ice: Linear cracks (1-pixel dark lines) in polygonal patterns
  - Sublimation pits: Small circular dark depressions (3-8 pixels)
- Irregular boundaries: Jagged or scalloped edge where ice meets rock
- Layered structure: Visible strata in cliff faces (horizontal pixel bands)

**Subsurface Ice (Exposed in Crater Walls):**
- Bright patches within darker material
- Irregular distribution: Lens-shaped or layer-like
- Color: Slightly blue-tinted white
- Creates two-tone crater walls: Brown soil + white ice

**Frost Deposits:**
- Very bright white pixels scattered across surface
- Seasonal variation: More extensive in winter, retreat in summer
- Preferentially in shadows: Concentrate in shaded regions
- Thin coating: Doesn't obscure underlying terrain texture

#### Liquid Surface Properties
**Open Water Bodies (Oceans, Lakes):**
- Dark blue shades (#0C2340 to #1E5A8E)
- Smooth texture: Minimal pixel variation (5-10% brightness range)
- Specular reflection: Linear bright streak pointing toward light source
  - Width: 3-12 pixels
  - Length: 20-100 pixels  
  - Oriented along sun vector
- Wave patterns (optional): Subtle parallel lines (1-pixel light/dark alternation)
- Shoreline: Irregular boundary with land, coastal features

**Hydrocarbon Lakes (Titan-like):**
- Orange-brown colors (#8B4513 to #A0522D)
- Very smooth: Almost no texture (liquid surface)
- Low reflectivity: Darker than water (less contrast)
- Irregular shoreline: Smooth curves, possible river deltas

**Lava Lakes:**
- Bright orange-yellow core (#FFAA00 to #FFFF00)
- Dark solidified crust: Black cracked surface with bright cracks
- Circular or oval shape
- Emission glow: Bright halo (3-8 pixels) around lake
- Temperature gradient: Center brightest, edges darker/cooler

#### Dust, Regolith & Fine Materials
**Lunar-Type Regolith:**
- Fine-grain texture: Checkerboard or Bayer dithering
- Gray tones (#808080 to #B0B0B0)
- Minimal color variation: Nearly monochromatic
- Tracks and disturbances: Slightly darker/lighter paths where compressed

**Martian Dust:**
- Red-orange coloration (#C1440E to #E27B58)
- Fine texture: Very small pixel noise pattern
- Dune fields:
  - Parallel ridges: Alternating light/dark stripes (3-8 pixels wide)
  - Slip faces: Darker steep faces, lighter windward slopes
  - Crest lines: 1-pixel bright line along dune tops
- Dust devils: Spiral patterns (if animated), temporary dark swirls

**Volcanic Ash Deposits:**
- Dark gray (#404040 to #707070)
- Smooth texture: Blankets and softens underlying terrain
- Thickness variation: Darker in depressions (thicker accumulation)
- Ray patterns: Dark streaks radiating from volcanic vents

#### Crystalline Structures
**Mineral Crystals:**
- Faceted appearance: Angular geometric shapes (triangular, hexagonal)
- High reflectivity: Bright highlight pixels on crystal faces
- Color: Depends on mineral (quartz = white/clear, sulfur = yellow, iron oxide = red)
- Size: 2-8 pixel individual crystals, can form 20-50 pixel clusters
- Sparkle effect: Scattered single bright pixels suggesting many tiny crystals

**Salt Flats:**
- Bright white expanse (#F5F5F5)
- Polygonal cracking pattern: Dark lines forming hexagons (15-40 pixel diameter)
- Very flat: Minimal topographic variation
- High albedo: Maintains brightness even in moderate shadow

---

## ATMOSPHERIC & WEATHER EFFECTS - COMPREHENSIVE

### Lower Atmosphere Cloud Systems

#### Cumulus Cloud Fields (Puffy Convective Clouds)
**Individual Cloud Structure:**
- Size: 15-60 pixel diameter per cloud
- Shape: Rounded top (cauliflower-like), flatter base
- Pixel construction:
  - Core: Bright white (#F5F5F5), 30-50% opacity
  - Edges: Softer white (#E0E0E0), 60-80% opacity with 2-4 pixel gradient fade
  - Base: Slightly darker gray (#D5D5D5), representing shaded underside
- 3D volumetric appearance:
  - Top highlight: 1-3 pixel clusters of pure white (sunlit top)
  - Side shading: Gradient from bright to shadow side
  - Base shadow: Darkest area, may show shadow cast onto surface

**Cumulus Field Distribution:**
- Coverage: 20-40% of visible surface
- Spacing: 10-30 pixel gaps between clouds
- Size variation: Mix of small (15-25 px), medium (30-45 px), large (50-70 px)
- Random placement: Avoid perfect grid, create natural clustering
- Development stages: Show clouds at different life stages (growing, mature, dissipating)

**Special Cumulus Variants:**
- Cumulonimbus (thunderstorm clouds):
  - Towering vertical development: Extend 15-40 pixels above other clouds
  - Anvil top: Flat spreading top expanding outward
  - Dark base: 50-70% darker than regular cumulus
  - Lightning: Bright jagged lines emanating from base (if animated)

#### Stratus Cloud Layers (Stratiform Sheets)
**Layer Characteristics:**
- Coverage: 60-95% of sky in affected regions
- Thickness: Appears as 3-8 pixel thick band wrapping sphere
- Color: Uniform light gray (#C8C8C8 to #E0E0E0)
- Texture: Very subtle variation (±5% brightness)
- Edges: Either sharp boundaries or gradual fade depending on atmospheric conditions

**Stratification Levels:**
- Low stratus: 3-5 pixels above surface, may touch surface (fog)
- Mid-level altostratus: 8-12 pixels above surface
- High cirrostratus: 15-25 pixels above surface, very thin (40-60% opacity)

**Textural Detail:**
- Undulation patterns: Gentle wave-like surface (sine wave displacement ±1-2 pixels)
- Breakthrough zones: Holes where surface visible through clouds (20-50 pixel diameter)
- Virga: Vertical dark streaks showing precipitation that doesn't reach surface (1-2 pixels wide, 10-20 pixels tall)

#### Cirrus Cloud Formations (High Wispy Ice Clouds)
**Fiber Structure:**
- Thin wispy strands: 1-3 pixels wide, 40-100 pixels long
- Curved trajectories: Follow wind direction, gentle arcs
- Opacity: 20-40% (very translucent)
- Color: White (#FFFFFF) to very pale blue (#F0F8FF)

**Patterns:**
- Parallel arrays: Multiple cirrus streaks aligned in same direction
- Mare's tails: Hooked or comma-shaped clouds
- Cirrus uncinus: Falling ice creating fall streaks below main cloud body

**Distribution:**
- Sparse coverage: 10-30% of sky
- High altitude positioning: 20-35 pixels above surface
- No cloud shadows: Too thin to block significant light

#### Storm Systems & Cyclonic Features

**Tropical Cyclones (Hurricanes/Typhoons):**
- Overall structure: Spiral formation, 80-200 pixel diameter
- Eye: Clear circular center (15-40 pixels), no clouds, visible surface
- Eye wall: Ring of densest clouds immediately surrounding eye
  - Brightest whites indicating tallest clouds
  - 5-12 pixels wide
  - Circular or slightly elliptical
- Spiral rain bands:
  - Curved arms spiraling inward toward center
  - 5-15 pixels wide
  - 3-7 major bands total
  - Counterclockwise rotation (Northern hemisphere) or clockwise (Southern)
- Shading variation: Brighter at rain band cores, darker between bands

**Mid-Latitude Cyclones:**
- Comma-shaped cloud pattern
- Cold front: Sharp linear cloud boundary (1-3 pixels wide defined edge)
- Warm front: Gradual cloud thickening (broader transition zone)
- Occlusion: Wrapped spiral at cyclone center
- Size: 150-400 pixel diameter
- Less organized than tropical cyclones

**Mesoscale Convective Complexes:**
- Large circular cloud cluster: 100-250 pixel diameter
- Composed of: Multiple embedded thunderstorm cells
- Bright central region: Coldest cloud tops (most active convection)
- Textured appearance: Lumpy surface from individual cell clusters

### Gas Giant Atmospheric Band Systems

#### Belt & Zone Structure
**Equatorial Zone (Bright):**
- Color: White to cream (#FFF8DC to #FFFACD)
- Width: 40-80 pixels at equator
- Brightness: 20-40% brighter than adjacent belts
- Rising air: Upwelling ammonia ice crystals create brightness

**Equatorial Belt (Dark):**
- Color: Orange-brown to red-brown (#CC5500 to #8B4513)
- Width: 30-60 pixels
- Position: Just north and south of equatorial zone
- Sinking air: Descending air exposes darker material beneath

**Tropical & Temperate Bands:**
- Alternating light (zones) and dark (belts)
- 8-15 bands per hemisphere
- Width variation: 15-50 pixels depending on latitude
- Color gradation: More orange near equator, more brown/gray toward poles

**Polar Regions:**
- Chaotic storm clusters: Less organized banding
- Color: Blue-gray (#6A7B8C) to brown-purple (#5D4E6D)
- Aurora: Green-blue glow at very high latitudes

#### Band Edge Dynamics
**Shear Zones (Where Bands Meet):**
- Turbulent texture: Swirling pixel patterns along boundaries
- Eddy formation: Small rotating features (10-25 pixels) embedded in shear zone
- Color mixing: Gradient transition between adjacent band colors
- Wave patterns: Sinusoidal undulation at boundary (wavelength 30-80 pixels)

**Jet Streams (Fast-Flowing Boundaries):**
- Visualized by: Sharp color transition and aligned cloud features
- Speed indicators: Stretched, elongated cloud formations
- Wind shear: Visible color/texture discontinuity

#### Embedded Storm Features
**Oval Storms:**
- Size: 20-120 pixels diameter
- Shape: Elliptical, oriented parallel to latitude lines
- Color: Usually lighter than surrounding belt (white ovals) or darker (brown barges)
- Interior: Rotating structure with defined outer rim and clear center
- Shadow: Slight darkening on one side suggesting elevation above main cloud deck

**Great Red Spot Style Mega-Storms:**
- Size: 80-200 pixel long axis, 60-120 pixel short axis
- Color: Red-orange (#CC3300 to #FF6347) standing out from surroundings
- Internal structure:
  - Outer rim: Slightly darker boundary ring
  - Rotating spiral: Visible curl patterns radiating from center
  - Central clearing: Lighter region at storm heart
  - Surrounding turbulence: Chaotic texture around storm periphery
- Longevity indicator: Sharp defined edges (long-lived), fuzzy edges (dissipating)

**Small-Scale Turbulence:**
- Convective towers: Bright white pixel clusters (5-15 pixels) rising above cloud deck
- Plumes: Elongated features stretching downstream from turbulence source
- Lightning storms: Clusters of bright pixel flashes (if animated)

### Atmospheric Glow & Light Interaction

#### Aurora (Polar Lights)
**Auroral Curtain Structure:**
- Location: Within 20-40° of magnetic poles
- Shape: Vertical curtain-like formations
- Height: Extending 10-30 pixels above surface
- Width: 2-8 pixels thickness
- Waving pattern: Sinusoidal curves giving flowing appearance

**Color Composition:**
- Oxygen emission: Green (#00FF88), most common, altitude 100-250km
- Oxygen emission: Red (#FF3333), higher altitude 250-600km
- Nitrogen emission: Blue-purple (#4444FF to #9D4EDD), lower altitudes
- Multiple colors: Layered curtains with different colors at different altitudes

**Dynamics (if animated):**
- Rippling motion: Wave propagation along curtain
- Pulsating: Brightness variations over time
- Expanding/contracting: Auroral oval changes size with solar wind intensity

**Visual Implementation:**
- Base layer: Solid color vertical pixel bands
- Gradient edges: Fade to transparency at top and bottom (40-0% opacity over 3-8 pixels)
- Glow effect: Soft additive bloom extending 2-5 pixels around core
- Multiple layers: Overlap 2-4 curtains at slightly different positions/colors

#### Airglow (Faint Atmospheric Luminescence)
- Thin luminous layer: 1-3 pixels wide at sphere limb
- Color: Often green (#66FF66) or red (#FF6666)
- Opacity: Very low, 10-25%
- Uniform band: Wraps entire planet at consistent altitude
- Chemiluminescence: Self-emission from atmospheric chemistry

#### Atmospheric Scattering Halos
**Blue Sky Effect (Rayleigh Scattering):**
- Visible at limb: Atmosphere appears bluer where viewing through maximum thickness
- Color shift: Surface colors shifted toward blue by 10-25° hue
- Gradual transition: Scattering increases from surface to limb edge over 15-40 pixels

**Red/Orange Sunset Effect:**
- Terminator region: Warm colors where light passes through thick atmosphere
- Color: Orange (#FF8C00) to red (#DC143C) band at day/night boundary
- Width: 10-30 pixels
- Brightness: Can be quite bright despite being twilight zone

**Limb Brightening:**
- Bright rim: 1-5 pixel width glow at very edge of atmosphere
- Color: Typically blue-white for oxygen-rich, other colors for different compositions
- Intensity: 30-80% brighter than adjacent atmospheric pixels
- Mechanism: Maximum atmospheric path length tangent to surface

---

## CELESTIAL BODY TYPE SPECIFICATIONS - ULTRA-DETAILED

### ROCKY PLANETS (Terrestrial Worlds) - Maximum Detail

#### Surface Composition & Texture Variants

**Primary Crust Material:**
- Basaltic composition (volcanic origin):
  - Color: Dark gray (#404040) to brown-gray (#6B5D52)
  - Texture: Fine-grained, uniform pixel patterns
  - Hardness: Minimal impact modification, sharp crater preservation
- Granitic composition (continental crust):
  - Color: Light gray (#B0B0B0) to tan (#D2B48C)
  - Texture: Coarser dithering, slight mottling
  - Reflectivity: Slightly higher albedo than basalt (+10-15%)
- Anorthosite (ancient highlands):
  - Color: Pale gray to white (#DCDCDC to #F0F0F0)
  - Texture: Smooth, bright surfaces
  - Ancient age: Heavily saturated with craters

**Secondary Surface Materials:**
- Volcanic lava flows:
  - Fresh flows: Very dark (#1A1A1A), smooth texture
  - Flow morphology: Finger-like extensions, lobes
  - Flow fronts: Distinct boundaries, sometimes raised (1-2 pixels)
- Impact melt sheets:
  - Glassy appearance: Smooth with few textures
  - Pooled in low areas: Flat regions within/around craters
  - Slightly lighter than surrounding basalt
- Sedimentary deposits (if water history):
  - Layered appearance: Horizontal pixel banding in cliff faces
  - Color: Red-brown (#A0522D) from iron oxidation
  - Sorted texture: Finer, more uniform than volcanic
- Wind-blown deposits:
  - Dunes: Organized ripple patterns (wavelength 15-40 pixels)
  - Dust blankets: Muting of underlying terrain texture
  - Yardangs: Streamlined ridges parallel to wind direction

#### Geographic Feature Density & Distribution

**Heavily Cratered Terrain (Ancient Surfaces):**
- Crater density: 40-80 visible craters per 10,000 square pixels
- Size distribution: Power law (many small, few large)
- Superposition relationships: Multiple generations of overlapping impacts
- Saturation: No original surface texture visible between craters
- Age implication: 4+ billion years old

**Moderately Cratered Terrain:**
- Crater density: 15-40 craters per 10,000 square pixels
- Visible between craters: Original plains or volcanic surfaces
- Mixed ages: Both ancient and recent features present

**Sparsely Cratered Terrain (Young Surfaces):**
- Crater density: <15 craters per 10,000 square pixels
- Large areas: Crater-free plains indicating recent resurfacing
- Volcanic flows: Fresh lava with minimal impacts
- Age implication: <1 billion years old

**Crater Modification States:**
- Fresh: Sharp rims, bright ejecta, defined rays (recent impacts)
- Degraded: Softened rims, fading ejecta, disappearing rays (moderate age)
- Subdued: Barely visible outlines, filled interiors (ancient, buried)
- Obliterated: Only detectable as circular color variations (very ancient)

#### Volcanic Landforms (Detailed Construction)

**Large Shield Volcanoes:**
- Base diameter: 100-250 pixels
- Height: 4-10 pixels above datum
- Slope angle: 3-10° (very gentle, implemented as gradual color gradient)
- Summit caldera: Circular depression (20-60 pixels), may have concentric collapse rings
- Radial lava flows: 50-150 pixel long flows radiating from summit
- Flow channels: Sinuous dark lines (2-5 pixels wide) on flanks
- Color: Varies with age—darker for recent, lighter for old oxidized flows

**Stratovolcanoes (Composite Cones):**
- Base diameter: 40-80 pixels
- Height: 5-9 pixels above surroundings
- Slope angle: 20-35° (steeper than shields, implemented as tighter gradient)
- Layered appearance: Alternating color bands showing lava and ash layers
- Summit crater: Small (5-15 pixels), may contain lava lake
- Pyroclastic flows: Fan-shaped dark deposits on flanks

**Volcanic Calderas:**
- Circular or elliptical: 30-120 pixel diameter
- Multiple collapse events: Concentric rings or step structures
- Floor: Flat, may be partially filled with later lava flows
- Peripheral vents: Smaller volcanic features around caldera rim

**Lava Flow Features:**
- Flow morphology types:
  - Pahoehoe: Smooth, ropey texture (gentle undulations)
  - Aa: Rough, blocky texture (chaotic pixel patterns)
  - Pillow lava: Bulbous mounds (if underwater eruption)
- Flow boundaries: Sharp color contrast between flow and surrounding terrain
- Lava tubes: Sinuous ridges with occasional collapse pits (dark circular holes)
- Lava channels: Leveed channels (raised edges) with central trough

#### Tectonic Features (Crust Deformation)

**Rift Systems:**
- Length: 200-800 pixels (can span multiple image tiles)
- Width: 20-80 pixels
- Structure:
  - Parallel bounding faults: Two linear scarps defining rift edges
  - Graben: Downdropped block between faults
  - Horst: Uplifted block (if present)
- Floor detail:
  - Volcanic vents: Scattered dark spots along rift axis
  - Floor fractures: Network of cracks
  - Possible flooding: Smooth dark fill if lava flooded

**Wrinkle Ridges (Compressional Features):**
- Length: 80-300 pixels
- Width: 3-10 pixels
- Height: 1-2 pixels (subtle)
- Sinuous pattern: Winding, never perfectly straight
- Asymmetric cross-section: Steeper on one side
- Location: Often in mare/plains regions

**Fault Scarps:**
- Linear cliff face: Sharp 1-pixel transition from top to bottom
- Height: 1-4 pixels
- Shadow: Dark pixels on shadow side of scarp face
- Displacement: Offset features crossing scarp (craters cut in half)

#### Polar Region Characteristics

**Ice Caps:**
- Bright white: (#F0FFFF to #FFFFFF)
- Irregular boundary: Jagged edge where ice meets rock
- Possible features:
  - Spiral troughs: Curved channels in ice (from sublimation, winds)
  - Layered deposits: Visible strata at edges (climate record)
  - Residual cap: Small permanent ice surviving summer
  - Seasonal frost: Larger extent in winter, retreats in summer
- Swiss cheese terrain: Circular and scalloped depressions in ice

**Polar Deserts (if no ice):**
- Extreme cold temperatures: Preserves ancient surfaces
- Unique crater morphology: Pedestal craters (ejecta forms raised platform)
- Limited weathering: Very sharp, fresh-appearing features

### GAS GIANTS (Jovian Worlds) - Atmospheric Detail

#### Cloud Deck Layering & Composition

**Upper Tropospheric Clouds (Visible Surface):**
- Composition: Ammonia ice crystals (NH₃)
- Color: White to cream (#FFFACD to #FFF8DC)
- Altitude: Highest visible clouds, top of weather layer
- Texture: Fluffy, high-contrast features
- Location: Zones (rising air regions)

**Mid-Tropospheric Clouds:**
- Composition: Ammonium hydrosulfide (NH₄SH)
- Color: Orange-brown (#CC5500 to #CD853F)
- Altitude: Below ammonia clouds
- Visibility: Exposed in belts where clouds descend
- Texture: More uniform than upper clouds

**Lower Tropospheric Clouds:**
- Composition: Water ice and liquid (H₂O)
- Color: Blue-gray (if visible) (#708090 to #4682B4)
- Altitude: Deep in atmosphere
- Visibility: Only in deep clearings, lightning illumination
- Texture: Occasionally glimpsed through holes in upper clouds

#### Atmospheric Circulation Patterns

**Zonal Winds (East-West Flow):**
- Jet streams: Located at band boundaries, speeds 100-400 km/h (visible as sharp edges)
- Wind direction alternation: Adjacent bands flow opposite directions
- Speed markers: Stretched, sheared cloud features indicating wind speed
- Stability: Patterns persist for years to decades (static for single image)

**Meridional Circulation (North-South Flow):**
- Rising air: In zones (bright bands)
- Sinking air: In belts (dark bands)
- Convective towers: Individual rising plumes (bright spots in zones)
- Downdrafts: Clearer areas in belts showing deeper layers

**Turbulence & Chaos Regions:**
- Eddy streets: Chain of small vortices (10-30 pixels each)
- Kelvin-Helmholtz waves: Breaking wave patterns at shear boundaries
- Vortex interactions: Collision and merging of storm systems
- Fractal complexity: Texture detail at multiple scales (large swirls contain smaller swirls)

#### Storm System Lifecycle & Appearance

**Young Growing Storms:**
- Bright white color: Fresh ammonia ice crystals lofted high
- Sharp defined edges: Strong circulation, organized structure
- Rapid internal rotation: Tight spiral patterns
- Small size: 20-50 pixels initially

**Mature Long-Lived Storms:**
- Established color: Red (Great Red Spot), white, brown depending on composition
- Large size: 80-200+ pixels
- Complex internal structure:
  - Multi-banded interior: Concentric rings of different colors
  - Spiral arms: Multiple spiral features converging on center
  - Central clearing or peak: Calm eye or highest cloud tower
- Stable position: Embedded in latitude band, may drift slowly

**Dissipating Weakening Storms:**
- Fading color: Blending toward surrounding atmosphere
- Fuzzy edges: Loss of sharp definition
- Elongation: Stretching due to shear winds
- Shrinking size: Gradual size decrease over time

#### Lightning & Internal Energy

**Lightning Storms:**
- Location: Deep in water cloud layer, visible through upper cloud gaps
- Appearance: Bright white pixel flashes (if animated)
- Clustering: Multiple strikes within 20-30 pixel radius (active storm cell)
- Day vs night: More visible on dark nightside hemisphere

**Internal Heat Visualization:**
- Infrared emission: Visible in certain wavelengths as bright regions
- Warmer areas: Slightly lighter/brighter tones suggesting internal heat escaping
- Hot spots: Locations of active convection or atmospheric downwelling

#### Ring Systems (If Present)

**Ring Structure:**
- Multiple rings: 3-10 distinct rings with gaps between
- Ringlets: Fine divisions within main rings (1-pixel narrow rings)
- Color variation: Different particle compositions show as color changes
  - Ice-rich: Bright white to gray (#E0E0E0 to #C0C0C0)
  - Rocky: Brown to tan (#8B7355 to #D2B48C)
  - Organic: Red-brown (#8B4513)

**Ring Transparency & Shadows:**
- Particle density: Denser rings more opaque, sparse rings translucent
- Shadow casting: Rings cast shadow bands on planet surface (parallel dark stripes)
- Shine-through: Faint visibility of planet through sparse ring sections
- Shadow on rings: Planet casts shadow on rings (wedge-shaped dark region)

**Ring Gaps:**
- Cassini Division: Major gap between rings (5-15 pixels wide, appears black/dark)
- Smaller gaps: 1-3 pixel dark bands
- Wave structures: Density waves create subtle brightness variations

**Ring Viewing Angle:**
- Edge-on: Thin line (barely visible, 1-2 pixels wide)
- Oblique: Elliptical appearance (compressed perspective)
- Face-on: Full ring structure visible

### ICE GIANTS (Uranian/Neptunian Worlds) - Methane Atmosphere

#### Atmospheric Color & Composition

**Methane Absorption:**
- Deep blue coloration: (#1E3A5F to #4682B4)
- Color mechanism: Red light absorbed by methane, blue reflected
- Gradient: Slightly lighter at limb from scattering
- Uniformity: Less variation than gas giants (fewer clouds)

**Stratospheric Haze:**
- High-altitude layer: Pale blue-white haze (#B0E0E6)
- Opacity: 20-40%, semi-transparent
- Smooth appearance: Minimal texture
- Extends above main atmosphere: 2-5 pixels beyond cloud deck

#### Subtle Cloud Features

**High-Altitude Methane Clouds:**
- Rare bright features: White pixel clusters (10-30 pixels)
- Irregular shapes: Not organized into bands like gas giants
- Transient: Appear and disappear over hours to days
- Composition: Methane ice crystals at very cold temperatures

**Dark Spots (Anticyclonic Storms):**
- Size: 40-120 pixels
- Color: Darker blue than surroundings (#0A1929)
- Shape: Oval or irregular
- Associated features: Bright companion clouds at edges (white wisps)
- Lifecycle: Form and disappear over months to years

#### Interior Structure Hints

**Magnetic Field Effects:**
- Unusual orientation: If magnetic poles far from rotation poles
- Aurora: May appear at unexpected latitudes (not just near poles)
- Asymmetry: One hemisphere may show more activity than other

**Internal Heat:**
- Minimal internal heating: Unlike gas giants, ice giants emit little heat
- Cooler appearance: More uniform, less convective activity
- Subtle features only: Lack of strong storms due to less internal energy

#### Ring Systems (Faint & Narrow)

**Dark Narrow Rings:**
- Color: Very dark gray to black (#202020 to #303030)
- Width: Individual rings 1-3 pixels wide
- Number: 5-13 distinct rings
- Composition: Carbonaceous material (dark organic compounds)
- Opacity: 70-95% opaque despite narrow width
- Gaps: 2-10 pixel spacing between rings

**Shepherd Moons:**
- Tiny satellites: 1-3 pixel dots
- Position: Just inside or outside rings
- Function: Gravitational interaction maintains ring edges

### MOONS (Natural Satellites) - Maximum Diversity

#### Moon Classification by Geological Activity

**Dead/Inactive Moons (No Current Geological Activity):**
- Surface characteristics:
  - Heavily cratered: 60-90% crater coverage
  - Pristine crater preservation: Sharp rims, no erosion
  - Ancient surface: 3.5-4.5 billion years old appearance
  - No atmosphere: No weathering, no softening of features
- Color palette: Monochromatic grays (#606060 to #C0C0C0)
- Texture: Hard-edged pixels, maximum detail preservation
- Examples: Earth's Moon, Callisto

**Geologically Active Moons:**
- Surface characteristics:
  - Low crater density: <10 craters per 10,000 square pixels
  - Active resurfacing: Fresh surfaces with minimal impacts
  - Volcanic/cryovolcanic features: Bright spots, flow patterns
  - Tectonic activity: Fractures, rifts, ridge systems
- Color variety: Yellows (sulfur), blues (ice), reds (organics)
- Dynamic features: Plumes, active vents, changing surfaces
- Examples: Io (volcanic), Europa (cryovolcanic), Enceladus (geysers)

**Tidally Flexed Moons:**
- Stress patterns: Linear and curved fracture systems
- Heat generation: Internal melting creates smooth regions
- Tidal bulge: Slight elongation toward parent planet (1-3% diameter difference)
- Surface renewal: Ongoing geological processes erasing old craters

#### Specific Moon Type Details

**Icy Ocean World Moons (Europa-type):**

**Ice Shell Characteristics:**
- Thickness representation: Bright white surface (#F0FFFF to #FFFFFF)
- Fracture patterns:
  - Lineae: Long straight or curved lines (1-3 pixels wide, 100-400 pixels long)
  - Triple bands: Three parallel lines (darker-lighter-darker pattern)
  - Cycloid patterns: Chain of arcs forming figure-8 patterns
  - Chaos terrain: Jumbled blocks of ice in irregular patterns (20-80 pixel regions)
- Color variation: Pure white (thick clean ice) to blue-white (thinner ice) to brown (surface contaminants)

**Subsurface Ocean Hints:**
- Thin ice regions: Slightly darker, blue-tinted (#D0E8F0)
- Upwelling zones: Circular or oval regions where warmer material reaches surface
- Geyser sites: Bright spots with radial fracture patterns
- Young surface: Very few craters (2-5 per 10,000 square pixels)

**Tectonic Features:**
- Ridge systems: Double ridges (parallel bright lines 2-5 pixels apart, 3-8 pixels wide total)
- Strike-slip faults: Offset features showing lateral movement
- Pull-apart basins: Rhomboid-shaped depressions at fault bends
- Pressure ridges: Compressional wrinkles where ice plates collide

**Sulfur-Rich Volcanic Moons (Io-type):**

**Volcanic Features (Dominant):**
- Active vents: Bright yellow-white spots (#FFFF00, 3-8 pixels) scattered across surface
- Lava flows: Orange to red pixel streams (#FF4500 to #CC0000)
  - Flow channels: Sinuous dark lines within brighter flow
  - Flow fronts: Sharp boundaries where lava solidified
  - Multiple generations: Overlapping flows of different ages/colors
- Volcanic calderas: Circular depressions (15-50 pixels) with dark floors
  - Multiple concentric collapse rings
  - Central bright spot if active
- Lava lakes: Circular bright regions (#FF8C00), may have dark crust with bright cracks

**Surface Color Palette (Extreme Variety):**
- Sulfur dioxide frost: White to yellow-white (#FFFACD)
- Sulfur compounds: Yellow (#FFFF00), orange (#FFA500), red (#FF0000)
- Silicate rock: Dark gray to black (#2F2F2F) where sulfur removed
- Pyroclastic deposits: Green (#90EE90), brown (#8B4513) mineral combinations
- Result: Rainbow-colored surface (most colorful moon)

**Plume Activity:**
- Vertical plumes: Umbrella-shaped eruptions extending 30-100 pixels above surface
- Plume composition: Sulfur dioxide gas and particles
- Fallout rings: Circular bright halos around active vents (50-150 pixel radius)
- Shadow casting: Dark pixel where plume blocks sunlight from reaching surface

**Heat Signature:**
- Hot spots: Brighter pixels indicating thermal emission
- Cooling flows: Gradient from bright (hot) to dark (cool) along flow length
- Thermal gradients: Visible color temperature variations

**Carbonaceous Dark Moons (Captured Asteroids):**
- Color: Very dark gray to black (#252525 to #454545)
- Albedo: Extremely low reflectivity (only 5-10% as bright as ice moons)
- Shape: Irregular potato/peanut form (not spherical)
- Surface: Heavily cratered with no resurfacing
- Texture: Uniform darkness with subtle crater shadows only feature
- Examples: Phobos, Deimos, outer irregular satellites

**Ring Shepherd Moons:**
- Position: Embedded within or adjacent to planetary rings
- Size: Very small (10-30 pixel diameter in context of full planet image)
- Function: Gravitational interactions maintain ring structure
- Surface: Accumulated ring particles on leading hemisphere
  - Two-tone appearance: Clean trailing side, dusty leading side
- Orbital effects: Create waves and gaps in nearby ring material

#### Tidal Locking Visual Effects

**Synchronous Rotation Consequences:**
- Near side (facing planet): Different appearance from far side
- Leading hemisphere: Impacts from orbit sweep more frequent
  - Higher crater density (1.5-2x more craters)
  - Darker color from accumulated impactor material
- Trailing hemisphere: Less impacted, cleaner surface
- Sub-planet point: Direct line to parent, may show stress features

**Libration Zones:**
- Areas visible from planet part-time: Mix of characteristics
- Complex crater patterns: Both leading and trailing hemisphere effects

### STARS (Stellar Objects) - Plasma Surface Detail

#### Stellar Surface Plasma Physics Visualization

**Granulation Pattern (Convection Cells):**
- Cell structure: Polygonal patterns covering entire visible surface
- Cell size: 8-20 pixels per granule (varies with star type)
- Cell characteristics:
  - Bright centers: Rising hot plasma (#FFF8DC to #FFFFFF)
  - Dark boundaries: Sinking cooler plasma (#FFD700 to #FFA500)
  - Irregular polygons: Mixture of 5-sided, 6-sided, 7-sided cells
- Texture: Bubbly, boiling appearance suggesting convective motion
- Coverage: 100% of surface exhibits granulation at some scale
- Lifetime: Individual granules change over time (if animated, 5-10 minute cycles)

**Supergranulation (Larger-Scale Convection):**
- Cell size: 50-120 pixels per supergranule
- Less visible: Subtle brightness variation (5-10% difference)
- Nested structure: Contains many smaller granules within
- Flow pattern: Horizontal flow from cell center to edges visible as texture alignment

#### Magnetic Activity Features

**Sunspot Groups (Active Regions):**

**Umbra (Dark Core):**
- Color: Dark orange to red-brown (#8B4513 to #CC5500)
- Brightness: 20-40% of surrounding photosphere
- Size: 10-40 pixels diameter
- Shape: Circular to irregular
- Texture: Relatively smooth with fine filigree structure
- Magnetic field: Strongest field concentration (2000-4000 Gauss)

**Penumbra (Lighter Surrounding Zone):**
- Color: Orange-yellow (#FFA500 to #FFB347)
- Brightness: 60-80% of photosphere
- Width: Equal to or greater than umbra diameter
- Texture: Radial filamentary structure
  - Dark filaments pointing toward umbra
  - Bright filaments between dark ones
  - Creates spiky appearance
- Width: 5-20 pixel band around umbra

**Sunspot Group Configuration:**
- Bipolar pair: Two main spots (opposite magnetic polarity)
- Following spots: Usually more diffuse, less defined
- Pores: Smaller dark spots (3-8 pixels) without penumbra
- Group count: 2-12 spots in active complex
- Distribution: Concentrated in specific latitude bands (15-35° from equator)

**Faculae (Bright Regions):**
- Location: Near sunspot groups at limb
- Brightness: 10-20% brighter than surrounding photosphere
- Size: 5-25 pixel bright patches
- Visibility: Most prominent near limb due to viewing angle
- Association: Mark areas of magnetic field concentration

**Plage Regions:**
- Bright patches visible in chromosphere (if viewing that layer)
- Extended areas: 40-100 pixels across
- Associated with active regions: Surround sunspot groups
- Color: Brighter yellow-white if visible

#### Prominence & Filament Structures

**Solar Prominences (Edge Features):**
- Position: Extending beyond limb into space
- Height: 15-80 pixels above surface
- Structure: Loop, arch, or curtain configurations
  - Loop prominences: Arching pixel structures connecting two surface points
  - Hedgerow prominences: Vertical curtain-like walls
  - Coronal rain: Falling material from prominence apex
- Color: Red-orange (#FF4500) from hydrogen alpha emission
- Pixel construction:
  - Base: Connected to surface (5-15 pixel width at base)
  - Arch: Curved pixel path (2-5 pixels thick) following magnetic field lines
  - Apex: Highest point (may have material dripping back down)
  - Transparency: 30-60% opacity, can see surface/space through structure

**Filaments (On-Disk Prominences):**
- Appearance: Dark winding lines on disk surface
- Color: Darker than surface (#CC5500 vs #FFD700)
- Shape: Sinuous, snake-like paths
- Length: 50-300 pixels
- Width: 2-8 pixels
- Structure: Dark core with slightly brighter edges

#### Solar Flare Events (If Active)

**Flare Brightening:**
- Location: Typically near sunspot groups
- Appearance: Sudden bright white region (500-1000% brightness increase)
- Size: 10-60 pixels diameter
- Duration: If animated, 10-30 minutes from peak to decay
- Color progression: White → yellow → orange as flare cools

**Associated Phenomena:**
- Coronal mass ejection initiation: Material lifting off surface
- Post-flare loops: Bright arching structures after flare
- Flare ribbons: Elongated bright regions marking magnetic reconnection site

#### Limb Features (Edge-On Structures)

**Spicule Forest:**
- Location: All around limb, especially prominent above active regions
- Appearance: Short hair-like jets extending above surface
- Length: 3-12 pixels beyond limb
- Density: Many thousands visible, creating fuzzy edge appearance
- Color: Darker red-orange than prominences
- Pixel implementation: 1-2 pixel wide vertical lines, irregular spacing (1-3 pixels apart)

**Chromosphere Visibility:**
- Thin colored layer: Visible as 1-3 pixel band at limb
- Color: Red-pink (#FF69B4) from hydrogen emission
- Separates photosphere from corona

**Corona (Outer Atmosphere):**
- Faint glow: 5-20 pixels beyond limb
- Opacity: 10-30%, very translucent
- Structure: 
  - Helmet streamers: Bright ray-like structures (5-8 pixels wide) extending outward
  - Coronal holes: Dark regions with less emission, open magnetic field
  - Active region loops: Bright arching structures connecting active regions
- Color: Pearl white (#F8F8FF) to pale blue (#E6F3FF)

#### Stellar Type Variations - Detailed Specifications

**O-Type & B-Type Stars (Blue Giants/Supergiants):**
- Color: Blue-white to deep blue (#A0D0FF to #4080FF)
- Surface temperature: Extremely hot (20,000-50,000K)
- Features:
  - Minimal visible spots: Too hot for stable magnetic structures
  - Intense surface activity: Rapid chaotic convection
  - Strong stellar wind: Mass loss visible at limb (streaming particles)
  - UV emission: Represented by intense white core brightness
- Granulation: Small, fast-moving cells (5-12 pixels)
- Edge: Crisp limb due to high gravity and compact size

**G-Type Stars (Sun-like):**
- Color: Yellow-white to golden yellow (#FFF8DC to #FFD700)
- Surface temperature: 5,000-6,000K
- Features:
  - Balanced activity: Moderate spot coverage, regular prominences
  - Clear granulation: Well-defined convection cells (8-15 pixels)
  - Stable magnetic field: Bipolar sunspot pairs, organized structure
- Limb: Pronounced limb darkening (30-40% darker at edge)

**K-Type & M-Type Stars (Orange/Red Dwarfs):**
- Color: Orange to deep red (#FF6347 to #8B0000)
- Surface temperature: 2,500-5,000K
- Features:
  - Extreme spot coverage: Up to 50% surface covered in spots
  - Massive prominences: Huge loops extending 30-50% of stellar radius
  - Flare-prone: Frequent bright flare events
  - Large granulation: Huge convection cells (15-40 pixels)
- Activity level: Very high magnetic activity despite cooler temperature

**Red Giant/Supergiant Stars:**
- Color: Red-orange to deep crimson (#CD5C5C to #8B0000)
- Surface temperature: 3,000-4,000K
- Features:
  - Enormous convection cells: 40-100 pixel granules (few cells cover entire hemisphere)
  - Irregular surface: Patchy brightness, asymmetric
  - Pulsations: If variable, brightness variations across surface
  - Extended atmosphere: Diffuse edge, hard to define exact limb
  - Dust formation: Dark molecular clouds forming in upper atmosphere
- Size: Massive diameter (render at maximum scale)

**White Dwarf Stars:**
- Color: Blue-white to pure white (#E0FFFF to #FFFFFF)
- Surface temperature: 8,000-40,000K (very hot)
- Features:
  - Featureless surface: No spots, no granulation visible
  - Extremely smooth: Solid or liquid surface, not gaseous
  - Intense brightness: High surface brightness per unit area
  - Crystalline structure (cool white dwarfs): Possible lattice patterns
- Size: Very small (render smaller than other stars, 30-60 pixels total diameter)
- Sharp limb: Crisp edge, no extended atmosphere

**Neutron Star (Magnetar):**
- Color: White-blue with intense glow (#F0F8FF to #FFFFFF)
- Size: Extremely small (20-40 pixels diameter)
- Features:
  - Magnetic field visualization: Colored lines/patterns (blue-purple #4169E1) wrapping surface
  - Pulsar beam: Bright white beams emitting from magnetic poles (if visible)
  - Hot spots: Small bright regions at magnetic poles
  - Starquake cracks: Linear dark fractures in crust (1-pixel lines)
- Extreme brightness: Highest brightness per pixel of any stellar object

### BLACK HOLES - Event Horizon & Accretion Physics

#### Event Horizon Representation

**Central Void (Black Circle):**
- Color: Pure black (#000000)
- Size: 30-80 pixels diameter (Schwarzschild radius)
- Edge: Perfectly sharp circular boundary
- Interior: Completely black, no detail whatsoever
- Gravitational region: Nothing escapes, ultimate darkness

**Photon Sphere:**
- Position: 1.5x Schwarzschild radius from center
- Appearance: Extremely thin bright ring (1-2 pixels)
- Color: White to pale blue (#F0FFFF)
- Physics: Photons orbit at this radius before falling in or escaping
- Completeness: May be partial ring if viewing angle not optimal

**Shadow Region:**
- Diameter: 2.6x Schwarzschild radius
- Appearance: Completely dark circle (includes photon sphere and event horizon)
- Observable: This is the actual "black" part visible to observer

#### Accretion Disk Structure - Multi-Zone Detail

**Inner Accretion Disk (Closest to Event Horizon):**
- Radius: 3-15 pixels from event horizon edge
- Temperature: Extremely hot (millions of Kelvin)
- Color: Blue-white to white (#E0F0FF to #FFFFFF)
- Brightness: 400-800% normal brightness (brightest region)
- Appearance: Intense glowing ring
- Relativistic effects:
  - Doppler boosting: One side significantly brighter (approaching side)
  - Gravitational redshift: Slight color shift toward red at inner edge
  - Frame dragging: Slight spiral appearance showing rotation direction

**Middle Accretion Disk:**
- Radius: 15-50 pixels from event horizon
- Temperature: Very hot (hundreds of thousands K)
- Color: Yellow-white to yellow-orange (#FFF8DC to #FFD700)
- Brightness: 200-400% normal brightness
- Features:
  - Spiral density waves: Brighter spiral arms (3-8 arms total)
  - Turbulent eddies: Small bright swirls (5-15 pixels) embedded in disk
  - Viscous heating: Brightness variations from friction

**Outer Accretion Disk:**
- Radius: 50-150 pixels from event horizon
- Temperature: Hot (thousands to tens of thousands K)
- Color: Orange to red-orange (#FF8C00 to #FF4500)
- Brightness: 100-200% normal brightness
- Features:
  - Larger spiral arms: More pronounced, wider spirals
  - Clumpy structure: Concentrated blobs of material
  - Magnetic field lines: Possible bright filamentary structures

**Disk Edge/Outer Regions:**
- Radius: 150-300 pixels from event horizon
- Temperature: Cooler (hundreds to thousands K)
- Color: Deep red to brown-red (#8B0000 to #8B4513)
- Brightness: 50-100% normal
- Appearance: Diffuse, fading into space
- Irregular edge: Torn, ragged boundary

#### Disk Viewing Angle Effects

**Face-On View (0-30° inclination):**
- Symmetric appearance: Circular rings, concentric structure
- Clear zonation: All temperature zones visible as rings
- Central shadow: Black hole shadow clearly defined circle
- Relativistic effects minimal: Less dramatic Doppler effect

**Moderate Inclination (30-70°):**
- Elliptical appearance: Disk appears as ellipse
- Front-back asymmetry: Front side partially obscures back side
- Doppler effect: One side brighter/bluer, other side dimmer/redder
- Shadow appears: Slightly elliptical

**Edge-On View (70-90° inclination):**
- Thin line appearance: Disk compressed to narrow band
- Extreme Doppler: One side much brighter than other
- Thickness visible: Can see vertical thickness of disk (2-8 pixels tall)
- Shadow appearance: Circular shadow visible above and below thin disk line

#### Particle Streams & Turbulent Flow

**Infall Streams:**
- Spiral trajectories: Pixel trails showing material spiraling inward
- Color Doppler shift:
  - Approaching material (toward observer): Blue-shifted, brighter (#A0D0FF)
  - Receding material: Red-shifted, dimmer (#FF6347)
- Motion blur: If animated, streaks showing orbital motion
- Density variations: Clumpy streams, not uniform flow

**Tidal Disruption Events:**
- If star being consumed: Elongated stellar material stream
- Spaghettification: Stretched material following curved path
- Temporary brightening: Very bright as torn star material heats up
- Color: Hot white-blue (#F0F8FF) from shock heating

#### Relativistic Jets (Active Galactic Nuclei)

**Jet Launch Region:**
- Origin: Perpendicular to disk, from near event horizon
- Base: Narrow (3-8 pixels wide at base)
- Collimation: Tight beam, minimal spreading near base

**Jet Structure:**
- Length: Extending 100-400 pixels from black hole
- Width: Gradual widening (10-30 pixels at far end)
- Core: Bright central spine (1-3 pixels, purple-blue #6A5ACD)
- Sheath: Dimmer outer layer surrounding core
- Knots: Bright blobs along jet length (shock fronts)
- Symmetry: Bipolar jets (one from each pole, opposite directions)

**Jet Composition Visualization:**
- Synchrotron emission: Purple-blue color indicating relativistic electrons
- Doppler boosting: Jet approaching observer much brighter
- Shock fronts: Bright knots where jet impacts surrounding medium
- Termination shock: Bright region where jet ends, impacts intergalactic medium

#### Gravitational Lensing Effects

**Background Object Distortion:**
- Einstein ring: Background galaxy/star smeared into ring around black hole
- Ring radius: Determined by mass and alignment
- Partial arcs: If alignment not perfect, crescents instead of complete ring
- Multiple images: Single background object appears multiple times

**Light Bending Visualization:**
- Space warping: Background star field curved around black hole
- Compression: Stars appear closer together near black hole edge
- Magnification: Background objects appear larger/brighter when lensed

**Accretion Disk Lensing:**
- Back side visible: Disk material behind black hole bent around top/bottom
- Shadow boundary: Disk material terminates at photon sphere
- Secondary image: Faint image of disk's far side visible as halo

#### Hawking Radiation (Theoretical Visualization)

**Quantum Glow:**
- Position: Extremely close to event horizon (0-2 pixels from edge)
- Appearance: Very faint glow (5-15% brightness)
- Color: Blue-white (#E0F0FF) from thermal radiation
- Uniformity: Even glow around entire horizon
- Scale: Only visible for small black holes (quantum effects negligible for stellar-mass and larger)

### ASTEROIDS & COMETS - Small Body Detail

#### Asteroid Physical Characteristics

**Shape Variants:**
- Spherical: Rare, only for largest asteroids (>400km, appear as 40-80 pixel spheres)
- Oblate: Slightly flattened (rotation-induced, 10% height reduction)
- Elongated: Stretched potato shape (2:1 or 3:1 length:width ratio)
- Bilobed: Peanut or dumbbell shape (contact binary)
- Irregular: Completely asymmetric chunk (most common)

**C-Type Asteroids (Carbonaceous):**
- Color: Very dark gray to black (#2F2F2F to #505050)
- Albedo: Extremely low (3-10% reflectivity)
- Composition: Carbon-rich, water-bearing minerals
- Surface texture:
  - Minimal contrast: Subtle features due to darkness
  - Uniform darkness: Little color variation
  - Shadow emphasis: Craters mainly visible via shadows

**S-Type Asteroids (Silicaceous/Stony):**
- Color: Gray to tan-brown (#808080 to #D2B48C)
- Albedo: Moderate (15-25% reflectivity)
- Composition: Silicate minerals, some metal
- Surface texture:
  - Varied brightness: Clear contrast between features
  - Color variation: Patches of different mineral concentrations

**M-Type Asteroids (Metallic):**
- Color: Light gray to silver (#A9A9A9 to #C0C0C0)
- Albedo: High (30-60% reflectivity)
- Composition: Iron-nickel metal
- Surface texture:
  - Bright specular highlights: Reflective surfaces
  - High contrast: Sharp shadows vs. bright spots
  - Minimal color: Monochromatic gray scale

**Surface Features:**
- Boulder fields: Clustered 2-8 pixel rocks covering surface
- Regolith: Fine dust layer (subtle texture, minimal contrast)
- Impact craters: Disproportionately large (50% diameter craters common)
- Grooves: Linear parallel troughs (1-3 pixels wide)
- Fractures: Crack patterns indicating structural weakness
- Facets: Flat surfaces creating angular blocky appearance

**Rotation Effects:**
- Tumbling: Irregular rotation (not simple spin)
- Rotation period: Affects shading distribution
- Centrifugal forces: May shed material at equator if rapid rotation

#### Comet Nucleus Characteristics

**Nucleus Surface:**
- Size: 10-40 pixels diameter (small bodies)
- Shape: Irregular potato, duck-shaped (bilobed common)
- Color: Very dark (#1F1F1F to #3F3F3F) from carbon compounds
- Composition: "Dirty snowball" - ice + rock + organics
- Craters: Few craters, active sublimation erases old features

**Active Regions (Jets):**
- Location: Scattered across nucleus, more common on sun-facing side
- Appearance: Bright spots (2-6 pixels) where gas/dust erupting
- Plume visibility: Thin streams extending from active spots
- Diurnal variation: More active when illuminated, less in shadow

#### Coma (Diffuse Atmosphere)

**Inner Coma:**
- Radius: 30-80 pixels from nucleus
- Density: High particle concentration
- Opacity: 40-70%, semi-transparent
- Color: White to pale yellow (#FFFACD)
- Texture: Fuzzy, cotton-like dithering
- Jets: Brighter linear features radiating from active regions

**Outer Coma:**
- Radius: 80-200+ pixels
- Density: Decreasing with distance
- Opacity: 10-30%, very translucent
- Boundary: Gradual fade to space (no sharp edge)

**Coma Shells:**
- Concentric structures: Rings of ejected material from rotating nucleus
- Spacing: Determined by rotation period (material ejected each rotation)
- Brightness variation: Shells visible as subtle brightness modulations

#### Dust Tail Structure

**Tail Shape:**
- Curvature: Follows orbital path (curved away from sun and back along orbit)
- Length: 100-800 pixels (can be extremely long)
- Width: Gradual widening from narrow (10 pixels) at nucleus to broad (40-100 pixels) at end
- Cross-section: Bright central spine, fading edges

**Dust Composition Visibility:**
- Color: Yellow-white to golden (#FFF8DC to #FFD700) from sunlight reflection
- Particle size gradient: Larger particles closer to nucleus, smaller farther
- Brightness falloff: Exponential decrease with distance from nucleus

**Tail Structure Details:**
- Streamers: Multiple parallel or slightly separated streams within main tail
- Striations: Fine linear structures showing particle trajectories
- Synchronic bands: Curved features where particles released simultaneously
- Disconnection events: Broken tail sections if magnetic interaction disrupts tail

#### Ion Tail (Plasma Tail)

**Tail Shape:**
- Direction: Straight, pointing directly away from sun (radial)
- Length: 100-1000 pixels (typically longer than dust tail)
- Width: Narrow (5-20 pixels), doesn't widen as much as dust tail

**Tail Appearance:**
- Color: Blue-cyan to blue (#4FC3F7 to #2196F3) from ionized gas emission
- Brightness: Fainter than dust tail (less reflective material)
- Texture: Ray-like, streaky appearance
- Visibility: Best visible against dark background

**Tail Structure:**
- Knots: Bright condensations where magnetic field concentrates plasma
- Kinks: Sharp bends from magnetic field disturbances
- Disconnection events: Complete tail severing (tail floats away, new tail grows)
- Multiple rays: 3-10 parallel or diverging ray structures

**Interaction with Solar Wind:**
- Magnetic field lines: Visible as ion tail follows field
- Turbulence: Chaotic motion at boundaries
- Helical structure: Twisted patterns from rotating magnetic field

#### Tail Interaction & Dynamics

**Dust vs. Ion Tail Separation:**
- Angle between tails: 5-45° depending on orbital velocity and solar wind strength
- Color contrast: Golden dust vs. blue ion creates clear visual separation
- Brightness difference: Dust usually 2-5x brighter than ion

**Anti-Tail (Forward Spike):**
- Direction: Points toward sun (opposite of main tails)
- Cause: Viewing geometry (seeing tail from below orbital plane)
- Appearance: Faint narrow spike (3-8 pixels wide, 50-150 pixels long)
- Visibility: Only at specific orbital positions

### EXOTIC CELESTIAL BODIES - Speculative & Unusual Objects

#### Rogue Planets (Interstellar Wanderers)

**Surface Appearance (No Stellar Illumination):**
- Primary light: Internal heat only (no reflected sunlight)
- Color: Deep red to infrared pseudo-color (#3F0000 to #8B0000)
- Brightness: Very dim (10-30% normal brightness)
- Temperature zones:
  - Hottest regions: Volcanic areas, core heat leakage (brighter red)
  - Coldest regions: Surface far from heat sources (near-black)

**Atmospheric Effects:**
- Frozen atmosphere: Condensed as surface ice/snow
- Thin residual atmosphere: Possible tenuous gas layer from core heat
- Color: Brown-red from frozen methane, nitrogen
- Aurora: Possible if magnetic field interacts with cosmic rays (green-blue glow at poles)

**Surface Features:**
- Ancient frozen terrain: Preserved features from when planet had star
- No new erosion: No weathering without stellar heating
- Possible ice geysers: If internal heat melts subsurface ice
- Darkness: Predominantly dark with subtle internal glow hints

#### Protoplanetary Disks (Planet-Forming Regions)

**Disk Structure:**
- Overall shape: Flat disk surrounding central protostar
- Radius: Extends 200-600 pixels from center
- Thickness: Thin (10-30 pixel vertical extent), appears edge-on if inclined

**Material Distribution:**
- Central clearing: Hot inner region with less material (gap 20-60 pixels radius)
- Dense annular zones: Rings of concentrated material at specific radii
- Spiral density waves: 2-6 spiral arms caused by gravitational instabilities
- Gap formation: Dark gaps where forming planets clear orbital paths (10-40 pixel wide bands)

**Color & Temperature Gradient:**
- Inner disk: Hot yellow-white (#FFF8DC), high temperature
- Middle disk: Orange-brown (#CC5500), moderate temperature
- Outer disk: Red-brown to dark brown (#8B4513 to #3F2F1F), cold material
- Ice line: Visible boundary where water freezes (color/brightness transition)

**Central Protostar:**
- Brightness: Very bright yellow-white core (#FFFACD)
- Obscuration: May be partially hidden by disk material
- Bipolar jets: Narrow beams (3-8 pixels wide) perpendicular to disk, extending 100-300 pixels
- Accretion: Bright inner region where disk material falls onto star

**Dynamic Features:**
- Infalling material: Streamers from outer disk spiraling inward
- Planetary embryos: Bright knots in disk (concentrations of forming planets)
- Shadow casting: Outer disk parts cast shadows on inner regions
- Turbulence: Chaotic motions, swirls, eddies in disk material

#### Dyson Swarms / Megastructures (Hypothetical)

**Orbital Structure:**
- Configuration: Multiple panels/satellites in orbital formation around star
- Distribution: Not solid shell - swarm of discrete units
- Coverage: Partial (~30-70% star occlusion), not complete sphere
- Orbital arrangement: Organized geometric patterns (hexagonal grid, nested shells)

**Panel Characteristics:**
- Shape: Regular geometric forms (hexagons, squares, triangles)
- Size: 5-20 pixels per individual panel
- Color: Dark gray to black (#202020 to #404040) on sun-facing (absorption)
- Reflective backing: Possible bright reflection on opposite side (#A0A0A0)
- Spacing: Gaps between panels (3-10 pixels) allow partial star visibility

**Visual Patterns:**
- Geometric arrays: Clear non-natural arrangement
- Shadow bands: Organized shadows on star surface from orbiting panels
- Glints: Specular reflections from panel edges/surfaces
- Infrared emission: If viewing in IR, panels glow from re-radiated heat (red-orange)

**Stellar Visibility:**
- Partially obscured: Star visible through gaps in swarm
- Uneven coverage: More panels in optimal orbits, fewer in others
- Dynamic appearance: If animated, panels orbit creating changing patterns

#### Pulsar (Rotating Neutron Star)

**Surface Features:**
- Extreme smoothness: No topography at pixel scale (surface gravity too high)
- Magnetic poles: Two bright spots where magnetic field exits (#E0E0FF)
- Hotspots: Extremely bright regions (1000%+ brightness) at magnetic poles
- Crust: Metallic appearance, gray-white to blue-white (#D0D0E0)

**Emission Beams:**
- Lighthouse effect: Two narrow beams (3-8 pixels wide) from magnetic poles
- Beam direction: Misaligned with rotation axis (oblique angle)
- Beam length: Extending 100-500+ pixels into space
- Color: Bright white to pale blue (#F0F8FF) from synchrotron radiation
- Beam profile: Brightest at center, gradual falloff to edges

**Rotation Visualization:**
- If animated: Extremely rapid rotation (potentially 30-700 rotations per second)
- Beam sweep: Beams rotate like lighthouse, illuminate surroundings
- Pulsing: Observer sees brightness pulse when beam points toward them

**Magnetosphere:**
- Magnetic field lines: Visualized as curved lines (blue-purple #6A5ACD) connecting poles
- Particle acceleration: Bright regions where particles trapped in magnetic field
- Polar caps: Glowing regions at magnetic poles where field lines exit

---

## ANIMATION REQUIREMENTS - COMPREHENSIVE DYNAMICS

### Rotation Dynamics (Detailed Physics)

**Realistic Rotation Speed Calculation:**
- Small asteroids: Very fast (hours to minutes per rotation), visible rotation in animation
- Earth-like planets: 24 hours per rotation (barely perceptible in short animation)
- Gas giants: 10-16 hours (moderately fast)
- Tidally locked moons: NO rotation relative to planet (same face always visible)
- Stars: 25-35 days (slow), faster at equator than poles

**Axial Tilt Visualization:**
- No tilt (0°): Simple equator-aligned rotation
- Moderate tilt (23-45°): Seasonal variations, polar regions receive variable sunlight
- Extreme tilt (>60°): Poles can face sun directly, unusual lighting patterns
- Uranus-like (98°): Rotation on side, poles alternately face sun for long periods

**Surface Feature Tracking (Movement):**
- Geographic features: Mountains, craters move across visible hemisphere with rotation
- Speed: Features near equator move fastest, slow near poles
- Persistence: Same features reappear after full rotation
- Coordinate systems: Maintain consistent latitude/longitude mapping

### Atmospheric Super-Rotation Dynamics

**Gas Giant Clouds (Fast Atmospheric Circulation):**
- Cloud speed: 400-600 km/h jet streams (clouds move faster than surface rotation)
- Band motion: Different bands move at different speeds (some faster, some slower)
- Differential rotation: Equatorial clouds complete rotation faster than polar clouds
- Shear zones: Visible at boundaries where different-speed bands meet

**Earth-like Atmosphere:**
- Cloud motion: Independent of surface rotation
- Jet stream bands: Fast-moving high-altitude clouds
- Weather systems: Rotating cyclones, moving storm fronts
- Realistic speed: Clouds move slower than gas giant atmospheres

### Dynamic Weather & Geological Effects

**Storm Evolution (Life Cycle):**
- Formation: Small disturbance grows into organized system (5-15 animation frames)
- Mature stage: Fully developed spiral structure, peak intensity
- Dissipation: Loss of organization, weakening winds, dissolution

**Cyclonic Rotation:**
- Northern hemisphere: Counter-clockwise rotation
- Southern hemisphere: Clockwise rotation
- Eye formation: Clear center develops as storm intensifies
- Spiral arms: Gradual tightening and loosening

**Lightning Activity:**
- Random flashes: Appear unpredictably within storm clouds
- Duration: 1-3 frames per flash (brief)
- Brightness: 500-1000% local brightness increase
- Cloud illumination: Nearby clouds briefly brighten
- Multiple simultaneous strikes: Clusters in active regions

**Volcanic Eruptions:**
- Lava fountain: Vertical jet of molten rock from vent
- Duration: Sustained for multiple seconds (or intermittent pulses)
- Fallout: Material falls back creating cone buildup
- Lava flows: Molten material streams down slope
- Plume: Ash and gas column rising above volcano

**Geyser Plumes (Cryovolcanic):**
- Eruption cycle: Periodic timing (every X seconds)
- Plume rise: Material accelerates upward
- Maximum height: Reaches peak altitude
- Fallout: Material rains back to surface
- Dissipation: Plume fades as material disperses

**Solar Flares (Stellar Activity):**
- Pre-flare: Magnetic tension builds (visible as brightening region)
- Flash: Sudden extreme brightening (1-3 frames peak brightness)
- Eruption: Material ejected upward from surface
- Post-flare loops: Arching magnetic structures remain
- Gradual decay: Return to normal appearance over time

### Accretion & Orbital Motion

**Black Hole Accretion Flow:**
- Spiral inward: Material follows curved spiraling path toward event horizon
- Speed increase: Orbital velocity increases closer to center
- Doppler effect: Visible blue-shift (approaching) and red-shift (receding) on opposite sides
- Turbulence: Chaotic swirling motions in disk

**Planetary Ring Particle Motion:**
- Differential rotation: Inner ring particles orbit faster than outer
- Particle collisions: Density waves propagate through rings
- Moonlet interactions: Gaps form and shepherd moons clear paths
- Resonances: Specific orbital ratios create patterns

### Lighting & Phase Changes

**Shadow Progression (Day/Night Cycle):**
- Terminator movement: Day/night boundary creeps across surface
- Speed: Depends on rotation rate (fast for Jupiter, slow for Venus)
- Lighting change: Features enter and exit sunlight
- Color shift: Terminator region shows warm sunset/sunrise colors

**Phase Changes (Orbital Position):**
- Crescent phase: Thin bright edge, large dark region
- Quarter phase: Half illuminated, half in shadow
- Gibbous phase: Mostly lit with small dark region
- Full phase: Completely illuminated hemisphere facing observer

**Eclipse Events:**
- Ingress: Shadow begins to fall on body
- Totality: Complete or partial darkness
- Egress: Shadow leaves body
- Shadow shape: Circular shadow transit across surface
- Brightness drop: 80-99% darkening in umbra

---

## UNIQUENESS ENFORCEMENT PROTOCOL - ADVANCED

### Mandatory Variation Parameters (Expanded)

Each generated asset MUST differ in ALL of the following aspects:

**1. Color Palette Uniqueness (Strict Requirements):**
- Primary hue: Different by at least 30° on color wheel
- Secondary hues: Unique combinations never used before
- Saturation distribution: Varied curves (high-to-low, uniform, bimodal)
- Brightness range: Different dynamic ranges (compressed, expanded)
- Color harmony type: Analogous, complementary, triadic, split-complementary (rotate through types)
- Accent colors: Different rare colors appearing in <5% of pixels
- Temperature bias: Warm-dominant, cool-dominant, neutral (alternate)

**2. Crater Distribution Mathematical Uniqueness:**
- Size distribution exponent: Vary power-law exponent (different slopes)
- Density: 10-90 craters per fixed area (wide range)
- Spatial clustering: Random, clustered, aligned in chains (different patterns)
- Size-range: Vary min/max crater diameters
- Age diversity: All fresh, all degraded, mixed ages (rotate scenarios)

**3. Geographic Layout (Topological Uniqueness):**
- Continent count: 1-12 continents (if applicable)
- Continent shape library: Never repeat same shapes
- Ocean-to-land ratio: 10-90% ocean coverage
- Pole-to-pole patterns: Symmetric, asymmetric, clustered polar features
- Equatorial structures: Rift valleys, mountain ranges, plains (different configurations)

**4. Atmospheric Banding (Gas Giants - Precise Variation):**
- Band count: 12-35 bands per hemisphere (vary count)
- Width distribution: Even widths, alternating thick-thin, random (different patterns)
- Color sequences: Never repeat same band-color-progression
- Wave patterns: Different wavelengths at shear zones
- Storm count: 3-18 embedded storms (different numbers)

**5. Storm Placement & Configuration:**
- Position: Different latitude/longitude coordinates
- Size: Vary diameter by 50-300% between assets
- Color: Unique storm colors for each asset (white, red, brown, orange combinations)
- Internal structure: Different spiral patterns, eye sizes, number of rings

**6. Texture Pattern Algorithms:**
- Dithering method: Bayer 2x2, 4x4, 8x8, checkerboard, random, line-based (rotate)
- Noise function: Perlin, Simplex, Worley, Value noise (change each asset)
- Frequency: Vary spatial frequency by factor of 2-10x
- Octaves: 1-8 noise octaves layered (different combinations)
- Seed: Cryptographically unique seed for each asset

**7. Rotation Axis & Tilt:**
- Obliquity: 0-98° axial tilt (full range)
- Rotation direction: Prograde (normal) or retrograde (backward) (15% retrograde)
- Pole position: Vary which pole faces viewer
- Tilt orientation: Random orientation of tilt axis in 3D space

**8. Ring System Configuration (If Present):**
- Ring count: 1-10 distinct rings
- Gap sizes: Vary from narrow (2 pixels) to wide (30 pixels)
- Ring opacity: 30-95% (different transparency levels)
- Ring angle: 0-90° inclination to ecliptic
- Ring color sequence: Never repeat same color progression

**9. Geological Age Indicators:**
- Crater density: Directly correlates to age (vary 100x range)
- Surface smoothness: Young (smooth) to ancient (rough) spectrum
- Color brightness: Fresh surfaces brighter, old surfaces dulled
- Tectonic activity: Active (few craters) to dormant (many craters)

**10. Composition & Material Indicators:**
- Mineral colors: Different iron content, silicate types, ice percentages
- Reflectivity: Vary albedo from 5% (dark carbonaceous) to 90% (fresh ice)
- Specular quality: Matte, semi-gloss, highly reflective (different surface properties)
- Atmospheric composition: O₂ (blue), CO₂ (orange), CH₄ (cyan), N₂ (colorless with haze)

**11. Scale & Size Variation:**
- Render diameter: 40-200 pixels (5x range)
- Feature scale consistency: Craters and mountains scaled appropriately with planet size
- Size class: Dwarf, small, medium, large, giant (represent full range)

**12. Lighting Conditions:**
- Light direction: Vary by 360° around sphere
- Light elevation: High angle (overhead) to low angle (glancing) (0-80° range)
- Light color temperature: Cool blue star, neutral Sun-like, warm red star (different sources)
- Multiple light sources: Single, double, triple star systems (1-3 stars)

### Procedural Generation Seed Management

**Cryptographic Seed Generation:**
- Algorithm: Use SHA-256 hash of timestamp + random salt + counter
- Length: 64 hexadecimal characters (256-bit)
- Uniqueness guarantee: Cryptographic collision resistance ensures no duplicates
- Documentation: Record seed for each asset for reproducibility

**Seed-Based Parameter Derivation:**
```
Seed Hash → Branch 1: Hue values (bytes 0-7)
         → Branch 2: Crater count (bytes 8-15)
         → Branch 3: Noise frequency (bytes 16-23)
         → Branch 4: Atmospheric bands (bytes 24-31)
         → [Continue for all parameters...]
```

**Noise Function Seeding:**
- Perlin noise: Seed determines gradient vector table
- Simplex noise: Seed initializes permutation table
- Worley noise: Seed sets feature point locations
- Multi-octave noise: Each octave uses derived sub-seed (seed + octave_number)

### Quality Assurance Checks (Automated Validation)

**Visual Similarity Detection:**
- Perceptual hashing: Generate phash for each asset (64-bit hash)
- Hamming distance: Compare new asset phash to previous 1000 assets
- Similarity threshold: Flag if Hamming distance <10 bits (too similar)
- Human review: If flagged, regenerate with different seed

**Histogram Analysis (Color Palette Validation):**
- RGB histogram: Create 3D histogram (16x16x16 bins)
- Distance metric: Calculate chi-squared distance to previous asset histograms
- Threshold: Require distance >0.3 (significant palette difference)
- Reject: If palette too similar, regenerate with modified color parameters

**Feature Detection Validation:**
- Crater counting: Automated detection and counting
- Geographic diversity: Measure fractal dimension of coastlines/features
- Texture complexity: Calculate entropy of pixel patterns
- Minimum requirements: Enforce minimum feature count and complexity

### Edge Case Prevention (Avoid Failures)

**Preventing "Empty" Assets:**
- Minimum feature density: Require at least 20 visible features
- Blank region limit: No more than 30% of surface can be featureless plain
- Texture requirement: At least 3 different textures/materials present
- Color diversity: Minimum 8 distinct colors in final palette

**Avoiding Repetitive Patterns:**
- Tiling detection: Check for unintentional repeating tile patterns
- Symmetry check: Avoid perfect bilateral or radial symmetry (unless intentional design)
- Pattern detection: Flag assets with excessive regularity
- Break patterns: Intentionally add asymmetric features to prevent tiling appearance

**Balancing Complexity:**
- Too simple: Add additional features if complexity score too low
- Too chaotic: Simplify if visual noise exceeds threshold (overwhelming detail)
- Target range: Maintain complexity score between 40-80 (on 0-100 scale)

---

## TECHNICAL SPECIFICATIONS - PRODUCTION READY

### Resolution & Format Standards

**Resolution Tiers:**
- Low: 256x256 pixels (retro, very low filesize)
- Standard: 512x512 pixels (optimal for most uses)
- High: 1024x1024 pixels (detailed, larger UI elements)
- Ultra: 2048x2048 pixels (maximum quality, print-ready)
- Extreme: 4096x4096 pixels (highest fidelity, for closeups/zooming)

**Aspect Ratio:**
- Square: 1:1 (standard for isometric spheres)
- Wide: 16:9 (if including background space/nebula)
- Portrait: 9:16 (vertical for mobile)

**File Format Specifications:**
- PNG: Primary format, lossless
  - Bit depth: 32-bit RGBA (24-bit color + 8-bit alpha)
  - Compression: Maximum compression (smallest file size)
  - Interlacing: Progressive (loads gradually)
- GIF: For animated versions
  - Color depth: 8-bit indexed (256 colors max per frame)
  - Frame rate: 10-30 fps
  - Loop: Infinite loop
- WEBP: Modern alternative
  - Lossless mode for pixel art
  - Smaller file size than PNG
  - Alpha channel support
- APNG: Animated PNG (better quality than GIF)
  - 24-bit color per frame
  - Alpha channel in animations
  - Larger file sizes but higher quality

### Color Depth & Palette Management

**Indexed Color Mode:**
- Palette size: 48-256 colors maximum
- Advantages: Authentic retro appearance, smaller file size, easy palette swapping
- Organization: Colors sorted by hue, then brightness
- Reserved colors: Black (#000000) and white (#FFFFFF) always included

**Palette Generation Strategy:**
- Base color selection: Choose 3-5 primary hues
- Shade generation: Create 8-12 brightness levels per hue
- Transition colors: Add intermediate hues for smooth blending
- Special colors: Emission, highlights, effects (10-20 additional colors)

### Layer Organization (PSD/Layered Format)

**Layer Structure for Editing:**
```
Group: Background
  - Layer: Space/stars (optional)
  - Layer: Transparent alpha

Group: Sphere Base
  - Layer: Geometric sphere shape (solid color)
  
Group: Surface Detail
  - Layer: Primary terrain colors
  - Layer: Craters and impacts
  - Layer: Mountains and valleys
  - Layer: Micro-texture detail
  
Group: Liquids (if applicable)
  - Layer: Oceans/lakes
  - Layer: Water highlights
  
Group: Ice (if applicable)
  - Layer: Ice caps
  - Layer: Frost deposits
  
Group: Atmosphere
  - Layer: Lower clouds
  - Layer: Upper clouds
  - Layer: Atmospheric glow at limb
  
Group: Weather (if applicable)
  - Layer: Storms and cyclones
  - Layer: Lightning effects
  
Group: Lighting
  - Layer: Shadows (multiply blend mode)
  - Layer: Highlights (add/lighten blend mode)
  - Layer: Terminator gradient
  
Group: Special Effects
  - Layer: Aurora
  - Layer: Volcanic glows
  - Layer: Ring systems (if applicable)
  
Group: Post-Processing
  - Layer: Outer glow/halo
  - Layer: Color adjustments (adjustment layer)
```

### Pixel Grid Alignment Requirements

**Grid System:**
- Base grid: 1 pixel = 1 unit (no subpixel positions)
- Isometric grid: 2:1 ratio tiles (2 pixels horizontal, 1 pixel vertical)
- Snap-to-grid: All features aligned to base grid

**Anti-Aliasing Grid:**
- AA pixels: Must still be on integer grid positions
- Color mixing: Achieve "subpixel" appearance through color values, not positions
- Half-pixel simulation: Use intermediate colors (50% blend) rather than fractional coordinates

### Rendering Pipeline (Recommended Process)

**Step 1: Generate Parameters**
- Roll unique seed
- Derive all variation parameters from seed
- Validate uniqueness against previous assets
- If duplicate detected, regenerate seed

**Step 2: Construct Geometry**
- Calculate latitude ring pixel widths
- Generate isometric sphere outline
- Create pixel map for surface coordinates

**Step 3: Generate Base Textures**
- Apply noise functions (Perlin/Simplex) to create heightmap
- Determine material zones (rock, ice, liquid, gas)
- Assign base colors from palette

**Step 4: Add Geographic Features**
- Procedurally place craters (power-law size distribution)
- Generate mountain ranges along tectonic features
- Add valleys, rifts, basins
- Create volcanic features

**Step 5: Apply Surface Textures**
- Add micro-detail using fine-scale noise
- Apply dithering patterns for material types
- Place individual boulders, small craters
- Add color variation within terrain types

**Step 6: Render Atmospheric Layers**
- Generate cloud patterns (for atmospheres)
- Apply atmospheric scattering colors
- Add weather systems (storms, cyclones)
- Create limb glow/haze

**Step 7: Calculate Lighting**
- Determine light source position
- Calculate surface normal vectors
- Apply shading (cell shading or gradient)
- Add specular highlights
- Cast shadows (form shadows and feature shadows)

**Step 8: Add Special Effects**
- Aurora near poles (if magnetic field)
- Volcanic glows and lava
- Lightning flashes in storms
- Ring shadows (if rings present)

**Step 9: Post-Processing**
- Add outer atmospheric glow
- Apply final color grading
- Add optional effects (bloom, chromatic aberration)
- Export at specified resolution

**Step 10: Validation**
- Run quality checks (feature count, color diversity)
- Compare to previous assets (similarity detection)
- If passes: Save and add to library
- If fails: Regenerate problematic components

---

## EXAMPLE PROMPT USAGE - EXPANDED TEMPLATES

### Detailed Prompt Template Structure

```
GENERATE PIXELATED ISOMETRIC CELESTIAL BODY ASSET

=== CORE IDENTIFICATION ===
Type: [Celestial Body Type]
Subtype: [Specific Variant]
Size Class: [Dwarf/Small/Medium/Large/Giant]
Unique Identifier: [Descriptive Name]

=== VISUAL STYLE PARAMETERS ===
Pixel Block Size: [3x3 / 5x5 / 8x8] pixels
Total Resolution: [512x512 / 1024x1024 / 2048x2048] pixels
Color Palette Size: [48-256] colors
Dithering Method: [Bayer / Checkerboard / Random / Ordered]
Anti-Aliasing: [Minimal / Moderate / Heavy]

=== COLOR SPECIFICATIONS ===
Primary Hue: [Color name] (#HEX) - [Percentage]%
Secondary Hue: [Color name] (#HEX) - [Percentage]%
Tertiary Hue: [Color name] (#HEX) - [Percentage]%
Accent Color: [Color name] (#HEX) - [Percentage]%
Shadow Tint: [Color name] (#HEX)
Highlight Color: [Color name] (#HEX)
Emission Colors (if applicable): [List]

=== SURFACE COMPOSITION ===
Primary Material: [Rock type / Ice / Gas / Metal]
Secondary Material: [Material description]
Material Coverage: [Primary X%, Secondary Y%, etc.]
Surface Age: [Young/Ancient] - [Crater density]
Texture Quality: [Smooth / Moderate / Rough / Chaotic]

=== GEOGRAPHIC FEATURES (Specific Pixel Measurements) ===
Major Features:
  - [Feature Type 1]: [Size] pixels, [Position], [Color]
  - [Feature Type 2]: [Size] pixels, [Position], [Color]
  - [Feature Type 3]: [Size] pixels, [Position], [Color]

Crater Field:
  - Density: [Number] per 10,000 sq pixels
  - Size Range: [Min-Max] pixels diameter
  - Degradation State: [Fresh / Degraded / Mixed]

Topographic Variation:
  - Elevation Range: [±X] pixels height displacement
  - Mountain Peaks: [Count], heights [X-Y] pixels
  - Valleys/Trenches: [Count], depths [X-Y] pixels below datum

=== ATMOSPHERIC SPECIFICATIONS (If Applicable) ===
Atmosphere Presence: [Yes/No/Thin]
Primary Composition: [Gas types]
Cloud Coverage: [Percentage]%
Cloud Types:
  - [Type 1]: [Coverage]%, [Altitude], [Color], [Opacity]%
  - [Type 2]: [Coverage]%, [Altitude], [Color], [Opacity]%

Weather Systems:
  - Storm Count: [Number]
  - Storm Sizes: [Range] pixels
  - Storm Colors: [List]
  - Lightning Activity: [None/Low/Moderate/High]

Atmospheric Bands (Gas Giants):
  - Band Count: [Number] per hemisphere
  - Band Width Range: [Min-Max] pixels
  - Band Color Sequence: [List from pole to pole]

Atmospheric Glow:
  - Limb Color: [Color] (#HEX)
  - Glow Radius: [X] pixels beyond surface
  - Opacity: [Percentage]%

=== LIGHTING SETUP ===
Primary Light Source:
  - Direction: [Angle] degrees from [Direction]
  - Elevation: [Angle] degrees above horizon
  - Color Temperature: [Value]K - [Color description]
  - Intensity: [Percentage]%

Shading Style: [Cell Shading / Smooth Gradient / Hybrid]
Shadow Zones: [Number] distinct brightness levels
Terminator Width: [X] pixels (day/night transition zone)

Specular Highlights:
  - Enabled: [Yes/No]
  - Size: [X-Y] pixels
  - Intensity: [Percentage]% brightness boost
  - Location: [Ice caps / Water / Metal / etc.]

=== SPECIAL FEATURES ===
[List unique identifying features]
- [Feature 1]: [Description], [Size], [Position], [Color]
- [Feature 2]: [Description], [Size], [Position], [Color]
- [Feature 3]: [Description], [Size], [Position], [Color]

Ring System (if present):
  - Ring Count: [Number]
  - Ring Radii: [List inner-outer radius for each]
  - Ring Colors: [List per ring]
  - Ring Opacity: [Percentage per ring]%
  - Ring Inclination: [Angle] degrees
  - Shadow on Planet: [Yes/No]

=== ROTATION & ORIENTATION ===
Axial Tilt: [Angle] degrees
Rotation Period: [Time] (for animation context)
Visible Hemisphere: [Front/Back], [North/South] pole [visible/hidden]
Isometric Angle: 30 degrees (standard)
Viewing Distance: [Context for scale]

=== ANIMATION PARAMETERS (If Animated) ===
Frame Rate: [FPS]
Duration: [Seconds] or [Number of Frames]
Loop: [Infinite / Once / X times]

Animated Elements:
- Rotation: [Speed] degrees per frame
- Clouds: [Speed] pixels per frame
- Storms: [Evolution over frames]
- Lightning: [Flash every X frames]
- Other: [Describe]

=== UNIQUENESS ENFORCEMENT ===
Procedural Seed: [64-character hexadecimal string]
Seed Generation Method: [SHA-256(timestamp + salt + counter)]

Variation Validation:
- Color palette unique: [Confirmed]
- Geographic layout unique: [Confirmed]
- Feature distribution unique: [Confirmed]
- Overall appearance distinct: [Confirmed]

Similarity Check:
- Phash Hamming Distance: [Value] bits (minimum 10)
- Histogram Distance: [Value] (minimum 0.3)

=== QUALITY REQUIREMENTS ===
Feature Count Minimum: 50 distinct features
Detail Density: [High / Ultra-High]
Texture Complexity Score: [40-80 range]
Color Diversity: Minimum 8 distinct palette colors used
Edge Definition: [Pixel-perfect / Slightly softened]

=== OUTPUT SPECIFICATIONS ===
File Format: [PNG / GIF / WEBP / APNG]
Color Mode: [Indexed / RGB / RGBA]
Compression: [Maximum / Balanced / None]
Layers: [Flattened / Layered PSD]
Metadata: Embed seed and parameters in file

=== FINAL DIRECTIVE ===
Create this celestial body asset ensuring it is completely unique,
visually distinct from all previously generated assets, and exhibits
maximum pixel-art quality with attention to every micro-detail.
This asset must be scientifically plausible while maintaining strong
artistic appeal and authentic retro pixel aesthetic.
```

### Specific Example Prompt 1: Hot Jupiter Gas Giant

```
GENERATE PIXELATED ISOMETRIC CELESTIAL BODY ASSET

=== CORE IDENTIFICATION ===
Type: Gas Giant (Jovian World)
Subtype: Hot Jupiter (Very Close Orbit to Star)
Size Class: Large
Unique Identifier: "Scorched Titan"

=== VISUAL STYLE PARAMETERS ===
Pixel Block Size: 5x5 pixels
Total Resolution: 1024x1024 pixels
Color Palette Size: 96 colors
Dithering Method: Bayer 4x4 matrix
Anti-Aliasing: Moderate (smooth sphere outline, sharp details)

=== COLOR SPECIFICATIONS ===
Primary Hue: Deep Crimson (#8B0000) - 45%
Secondary Hue: Burnt Orange (#CC5500) - 30%
Tertiary Hue: Dark Brown (#3E2723) - 20%
Accent Color: Bright Yellow (#FFD700) - 5% (storm highlights)
Shadow Tint: Purple-Brown (#3F2F3F)
Highlight Color: Pale Yellow (#FFF8DC)
Emission Colors: White-Hot (#FFFACD) for extreme temperature zones

=== SURFACE COMPOSITION ===
Primary Material: Hydrogen/Helium atmosphere (superheated)
Secondary Material: Vaporized metals and silicates in upper atmosphere
Material Coverage: Gas 100% (no solid surface)
Surface Age: N/A (dynamic atmosphere)
Texture Quality: Highly turbulent, chaotic flow patterns

=== GEOGRAPHIC FEATURES (Atmospheric) ===
Major Features:
  - Dayside Hot Spot: 80 pixels diameter, dead center of sun-facing side, bright yellow-white
  - Twilight Terminator Band: 40 pixels wide gradient zone, orange to deep red
  - Nightside Dark Region: Deep maroon, 180 pixel span, minimal emission

Atmospheric Banding:
  - Band Count: 18 total (9 per hemisphere)
  - Highly disrupted: Bands turbulent and broken (not smooth like Jupiter)
  - Width Range: 20-55 pixels per band

Storm Systems:
  - 11 major oval storms embedded in bands
  - Storm sizes: 25-70 pixels diameter
  - Storm colors: Bright yellow, orange-white, dark brown
  - 3 mega-storms (>60 pixels): One at dayside hot spot, two in mid-latitudes

=== ATMOSPHERIC SPECIFICATIONS ===
Atmosphere Presence: Yes (Thick)
Primary Composition: H₂, He with vaporized sodium, potassium, titanium oxide
Cloud Coverage: 100% (all atmosphere, no surface)
Cloud Types:
  - High-altitude Hazes: 20%, 25 pixels above datum, yellow-white, 40% opacity
  - Mid-level Clouds: 60%, datum level, crimson-orange, 80% opacity
  - Deep Clouds: 20%, -10 pixels below datum, dark brown, visible through breaks

Weather Systems:
  - Storm Count: 18 visible systems
  - Storm Sizes: 15-80 pixel range
  - Storm Colors: Yellow cores, orange mid-tones, brown edges
  - Lightning Activity: High (visible in 8 storm systems)

Atmospheric Bands (Gas Giant Specific):
  - Band Count: 18 per hemisphere (36 total)
  - Band Width Range: 18-55 pixels
  - Band Color Sequence (equator to pole): Dark brown, crimson, orange, brown-orange, deep red, crimson, orange-red, maroon, deep brown [repeat mirrored for southern hemisphere]

Atmospheric Glow:
  - Limb Color: Orange-Yellow (#FFA500)
  - Glow Radius: 12 pixels beyond surface
  - Opacity: 35%
  - Thermal Emission: Visible as brightness on nightside (planet glows from internal heat)

=== LIGHTING SETUP ===
Primary Light Source:
  - Direction: Directly from left (90 degrees)
  - Elevation: 0 degrees (equatorial illumination)
  - Color Temperature: 9000K - Blue-white parent star
  - Intensity: 300% (extremely close to star)

Shading Style: Cell Shading (5 zones: extreme bright, bright, neutral, dim, nightside glow)
Shadow Zones: 5 distinct levels
Terminator Width: 55 pixels (moderate atmospheric scattering)

Specular Highlights:
  - Enabled: No (gas surface doesn't have specular reflection)
  - Diffuse reflection only

Extreme Temperature Effects:
  - Dayside: Superheated, brightest region
  - Nightside: Thermally glowing (not completely dark)
  - Heat redistribution visible: Jet streams carrying heat to nightside

=== SPECIAL FEATURES ===
Unique Identifying Features:
- Dayside Focal Hot Spot: 80 pixel diameter region of extreme brightness (#FFFACD), 
  surrounded by turbulent convection cells creating mottled texture
- Terminator Storm Chain: 5 large storms (40-60 pixels each) aligned along day-night 
  boundary, showing extreme thermal gradients
- Nightside Emission: Faint red glow (#4F0000) visible on dark side from retained heat, 
  20% base brightness instead of complete darkness
- Atmospheric Shockwave: Visible circular wave pattern (120 pixels diameter) emanating 
  from impact/disturbance in southern hemisphere
- Lightning Clusters: 8 visible lightning storm systems with pixel-flash effects, 
  concentrated in turbulent mid-latitude bands

Ring System: None (tidally disrupted too close to star)

=== ROTATION & ORIENTATION ===
Axial Tilt: 3 degrees (minimal tilt)
Rotation Period: 2.8 Earth days (tidally approaching lock)
Visible Hemisphere: Dayside prominently visible (60% lit), terminator region prominent
Isometric Angle: 30 degrees (standard)
Viewing Distance: Medium (show full disk plus glow)

=== ANIMATION PARAMETERS ===
Frame Rate: 24 FPS
Duration: 8 seconds (192 frames)
Loop: Infinite

Animated Elements:
- Rotation: 0.75 degrees per frame (slow rotation showing tidal locking tendency)
- Clouds: Jet streams move 2-4 pixels per frame (super-fast winds from extreme heating)
- Storms: Storms slowly rotate internally, complete rotation every 3 seconds
- Lightning: Random flashes every 4-12 frames in active storm regions
- Heat shimmer: Subtle pixel displacement (±1 pixel) in hottest regions simulating turbulence
- Terminator shift: Slight movement as rotation progresses

=== UNIQUENESS ENFORCEMENT ===
Procedural Seed: 7A3E9B2C8F1D4E6A0B9C7D2E5F8A1B3C4D6E8F0A2C5D7E9B1C3E5F7A9B2D4E6F8A0
Seed Generation Method: SHA-256(2024-11-02T15:32:11Z + "hot_jupiter_87" + 00042)

Variation Validation:
- Color palette unique: Crimson-dominated not used in prior 50 assets ✓
- Geographic layout unique: Hot Jupiter extreme dayside heating pattern new ✓
- Feature distribution unique: Terminator storm chain configuration original ✓
- Overall appearance distinct: Thermal emission nightside glow distinctive ✓

Similarity Check:
- Phash Hamming Distance: 18 bits (well above minimum 10) ✓
- Histogram Distance: 0.67 (well above minimum 0.3) ✓

=== QUALITY REQUIREMENTS ===
Feature Count Minimum: 65 distinct features (18 storms + atmospheric features)
Detail Density: Ultra-High (maximum turbulence detail)
Texture Complexity Score: 72 (high chaos from thermal effects)
Color Diversity: 18 distinct palette colors actively used
Edge Definition: Pixel-perfect on sphere, softened at atmospheric glow

=== OUTPUT SPECIFICATIONS ===
File Format: APNG (animated PNG for quality animation)
Color Mode: RGBA (full color with transparency for glow)
Compression: Maximum (optimize file size)
Layers: Include source PSD with separated layers
Metadata: Embed full prompt and seed in PNG metadata

=== FINAL DIRECTIVE ===
Create this Hot Jupiter gas giant with emphasis on extreme thermal effects from 
close stellar proximity. The dayside must show superheating with brilliant yellow-white 
hot spot, while nightside should exhibit unusual thermal glow from retained heat. 
Atmospheric bands must be highly disrupted and turbulent, unlike orderly Jupiter-type 
banding. Lightning storms and convective chaos should dominate the appearance, creating 
a visually striking asset that clearly represents a world in thermal extremis.
```

---

This completes the ultra-detailed celestial body asset generation prompt document. The document now includes:

✅ **Complete pixel art specifications** with mathematical formulas
✅ **All celestial body types fully detailed** (rocky planets, gas giants, ice giants, moons, stars, black holes, asteroids, comets, exotic bodies)
✅ **Advanced animation requirements** with physics-based dynamics
✅ **Comprehensive uniqueness enforcement** with validation protocols
✅ **Production-ready technical specifications** 
✅ **Expanded prompt templates** with complete examples

Total length: **90,000+ characters** of dense technical and creative specifications.