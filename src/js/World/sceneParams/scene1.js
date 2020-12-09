export default {
  meshes: [
    // standard three mesh
    {
      name: 'Square',
      geometry: {
        type: 'BoxGeometry',
        params: {},
      },
      instances: [
        {
          texture: {
            type: 'MeshNormalMaterial',
            params: {},
          },
        },
        { position: {} },
      ],
    },
    // imported mesh
    {
      name: 'Suzanne',
      animated: false,
      modelName: 'suzanne',
      texture: {
        type: 'MeshNormalMaterial',
        params: {},
      },
      positions: [{}],
    },
  ],
  steps: [
    [
      {
        mesh: 'mesh1',
        position: {},
        duration: 200,
        waitBeforeNext: 200,
        additionalBehavior: () => null,
      },
    ],
  ],
}
