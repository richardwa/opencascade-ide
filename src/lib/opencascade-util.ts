import { OpenCascade, TopoDS_Shape, initOpenCascade } from 'opencascade.js';
import {
  Face3,
  Vector3
} from 'three';

type Goemetry = {
  vertices: Float32Array;
  normals: Float32Array;
  indices: Uint32Array | Uint16Array;
}
export let openCascade: OpenCascade = null;

console.time('wasm load');
export const openCascadePromise = initOpenCascade().then(oc => {
  console.timeEnd('wasm load');
  openCascade = oc;
  return oc.ready;
});


export const openCascadeHelper = {
  tessellate(shape: TopoDS_Shape) {
    const facelist = [];
    new openCascade.BRepMesh_IncrementalMesh_2(shape, 0.1, false, 0.5, false);
    const ExpFace = new openCascade.TopExp_Explorer_1();
    for (ExpFace.Init(shape, openCascade.TopAbs_ShapeEnum.TopAbs_FACE, openCascade.TopAbs_ShapeEnum.TopAbs_SHAPE); ExpFace.More(); ExpFace.Next()) {
      const myFace = openCascade.TopoDS.Face_1(ExpFace.Current());
      const aLocation = new openCascade.TopLoc_Location_1();
      const myT = openCascade.BRep_Tool.Triangulation(myFace, aLocation);
      if (myT.IsNull()) {
        continue;
      }

      const this_face = {
        vertex_coord: [] as number[],
        normal_coord: [] as number[],
        tri_indexes: [] as number[],
        number_of_triangles: 0,
      };

      const pc = new openCascade.Poly_Connect_2(myT);
      const Nodes = myT.get().Nodes();

      // write vertex buffer
      this_face.vertex_coord = new Array(Nodes.Length() * 3);
      for (let i = Nodes.Lower(); i <= Nodes.Upper(); i++) {
        const p = Nodes.Value(i).Transformed(aLocation.Transformation());
        this_face.vertex_coord[((i - 1) * 3) + 0] = p.X();
        this_face.vertex_coord[((i - 1) * 3) + 1] = p.Y();
        this_face.vertex_coord[((i - 1) * 3) + 2] = p.Z();
      }

      // write normal buffer
      const myNormal = new openCascade.TColgp_Array1OfDir_2(Nodes.Lower(), Nodes.Upper());
      openCascade.StdPrs_ToolTriangulatedShape.Normal(myFace, pc, myNormal);
      this_face.normal_coord = new Array(myNormal.Length() * 3);
      for (let i = myNormal.Lower(); i <= myNormal.Upper(); i++) {
        const d = myNormal.Value(i).Transformed(aLocation.Transformation());
        this_face.normal_coord[((i - 1) * 3) + 0] = d.X();
        this_face.normal_coord[((i - 1) * 3) + 1] = d.Y();
        this_face.normal_coord[((i - 1) * 3) + 2] = d.Z();
      }

      // set uvcoords buffers to NULL
      // necessary for JoinPrimitive to be performed
      // this_face.tex_coord = null;

      // write triangle buffer
      const orient = myFace.Orientation_1();
      const triangles = myT.get().Triangles();
      this_face.tri_indexes = new Array(triangles.Length() * 3);
      let validFaceTriCount = 0;
      for (let nt = 1; nt <= myT.get().NbTriangles(); nt++) {
        const t = triangles.Value(nt);
        let n1 = t.Value(1);
        let n2 = t.Value(2);
        let n3 = t.Value(3);
        if (orient !== openCascade.TopAbs_Orientation.TopAbs_FORWARD) {
          let tmp = n1;
          n1 = n2;
          n2 = tmp;
        }
        // if(TriangleIsValid(Nodes.Value(1), Nodes.Value(n2), Nodes.Value(n3))) {
        this_face.tri_indexes[(validFaceTriCount * 3) + 0] = n1;
        this_face.tri_indexes[(validFaceTriCount * 3) + 1] = n2;
        this_face.tri_indexes[(validFaceTriCount * 3) + 2] = n3;
        validFaceTriCount++;
        // }
      }
      this_face.number_of_triangles = validFaceTriCount;
      facelist.push(this_face);
    }
    return facelist;
  },
  joinPrimitives(facelist: any[]) {
    let obP = 0;
    let obN = 0;
    let obTR = 0;
    let advance = 0;
    const locVertexcoord = [] as number[];
    const locNormalcoord = [] as number[];
    const locTriIndices = [] as number[];

    facelist.forEach((myface: { vertex_coord: string | any[]; normal_coord: string | any[]; tri_indexes: string | any[]; }) => {
      for (let x = 0; x < myface.vertex_coord.length / 3; x++) {
        locVertexcoord[(obP * 3) + 0] = myface.vertex_coord[(x * 3) + 0];
        locVertexcoord[(obP * 3) + 1] = myface.vertex_coord[(x * 3) + 1];
        locVertexcoord[(obP * 3) + 2] = myface.vertex_coord[(x * 3) + 2];
        obP++;
      }
      for (let x = 0; x < myface.normal_coord.length / 3; x++) {
        locNormalcoord[(obN * 3) + 0] = myface.normal_coord[(x * 3) + 0];
        locNormalcoord[(obN * 3) + 1] = myface.normal_coord[(x * 3) + 1];
        locNormalcoord[(obN * 3) + 2] = myface.normal_coord[(x * 3) + 2];
        obN++;
      }
      for (let x = 0; x < myface.tri_indexes.length / 3; x++) {
        locTriIndices[(obTR * 3) + 0] = myface.tri_indexes[(x * 3) + 0] + advance - 1;
        locTriIndices[(obTR * 3) + 1] = myface.tri_indexes[(x * 3) + 1] + advance - 1;
        locTriIndices[(obTR * 3) + 2] = myface.tri_indexes[(x * 3) + 2] + advance - 1;
        obTR++;
      }

      advance = obP;
    });
    return [locVertexcoord, locNormalcoord, locTriIndices];
  },
  objGetTriangle(trianglenum: number, locTriIndices: number[]) {
    const pID = locTriIndices[(trianglenum * 3) + 0] * 3;
    const qID = locTriIndices[(trianglenum * 3) + 1] * 3;
    const rID = locTriIndices[(trianglenum * 3) + 2] * 3;

    const vertices = [pID, qID, rID];
    const normals = [pID, qID, rID];
    const texcoords = [pID, qID, rID];
    return [vertices, normals, texcoords];
  },
  generateGeometry(tot_triangle_count: number, locVertexcoord: number[], locNormalcoord: number[], locTriIndices: number[]): [Vector3[], Face3[]] {
    const vertices: Vector3[] = [];
    const faces: Face3[] = [];
    function v(x: number, y: number, z: number) {
      vertices.push(new Vector3(x, y, z));
    }
    function f3(a: number, b: number, c: number, n1_x: number, n1_y: number, n1_z: number, n2_x: number, n2_y: number, n2_z: number, n3_x: number, n3_y: number, n3_z: number) {
      faces.push(new Face3(a, b, c, [
        new Vector3(n1_x, n1_y, n1_z),
        new Vector3(n2_x, n2_y, n2_z),
        new Vector3(n3_x, n3_y, n3_z)
      ]));
    }
    for (let i = 0; i < tot_triangle_count; i++) {
      const [vertices_idx, /*normals_idx*/, /*texcoords_idx*/] = this.objGetTriangle(i, locTriIndices);
      // first vertex
      v(
        locVertexcoord[vertices_idx[0] + 0],
        locVertexcoord[vertices_idx[0] + 1],
        locVertexcoord[vertices_idx[0] + 2]
      );
      // second vertex
      v(
        locVertexcoord[vertices_idx[1] + 0],
        locVertexcoord[vertices_idx[1] + 1],
        locVertexcoord[vertices_idx[1] + 2]
      );
      // third vertex
      v(
        locVertexcoord[vertices_idx[2] + 0],
        locVertexcoord[vertices_idx[2] + 1],
        locVertexcoord[vertices_idx[2] + 2]
      );
    }
    for (let i = 0; i < tot_triangle_count; i++) {
      const [/*vertices_idx*/, normals_idx, /*texcoords_idx*/] = this.objGetTriangle(i, locTriIndices);
      f3(
        0 + i * 3,
        1 + i * 3,
        2 + i * 3,
        locNormalcoord[normals_idx[0] + 0],
        locNormalcoord[normals_idx[0] + 1],
        locNormalcoord[normals_idx[0] + 2],
        locNormalcoord[normals_idx[1] + 0],
        locNormalcoord[normals_idx[1] + 1],
        locNormalcoord[normals_idx[1] + 2],
        locNormalcoord[normals_idx[2] + 0],
        locNormalcoord[normals_idx[2] + 1],
        locNormalcoord[normals_idx[2] + 2]
      );
    }
    return [vertices, faces];
  },
  visualize(shape: TopoDS_Shape) {
    const geometries: Goemetry[] = [];
    const ExpFace = new openCascade.TopExp_Explorer_1();
    for (ExpFace.Init(shape, openCascade.TopAbs_ShapeEnum.TopAbs_FACE, openCascade.TopAbs_ShapeEnum.TopAbs_SHAPE); ExpFace.More(); ExpFace.Next()) {
      const myShape = ExpFace.Current()
      const myFace = openCascade.TopoDS.Face_1(myShape);
      let inc
      try {
        //in case some of the faces can not been visualized
        inc = new openCascade.BRepMesh_IncrementalMesh_2(myFace, 0.1, false, 0.5, false);
      } catch (e) {
        console.error('face visualizi<ng failed')
        continue
      }

      const aLocation = new openCascade.TopLoc_Location_1();
      const myT = openCascade.BRep_Tool.Triangulation(myFace, aLocation);
      if (myT.IsNull()) {
        continue;
      }


      const pc = new openCascade.Poly_Connect_2(myT);
      const Nodes = myT.get().Nodes()

      let vertices = new Float32Array(Nodes.Length() * 3)

      // write vertex buffer
      for (let i = Nodes.Lower(); i <= Nodes.Upper(); i++) {
        const t1 = aLocation.Transformation()
        const p = Nodes.Value(i)
        const p1 = p.Transformed(t1);
        vertices[3 * (i - 1)] = p.X()
        vertices[3 * (i - 1) + 1] = p.Y()
        vertices[3 * (i - 1) + 2] = p.Z()
        p.delete()
        t1.delete()
        p1.delete()
      }
      // write normal buffer
      //


      const myNormal = new openCascade.TColgp_Array1OfDir_2(Nodes.Lower(), Nodes.Upper());
      openCascade.StdPrs_ToolTriangulatedShape.Normal(myFace, pc, myNormal);

      let normals = new Float32Array(myNormal.Length() * 3)
      for (let i = myNormal.Lower(); i <= myNormal.Upper(); i++) {
        const t1 = aLocation.Transformation()
        const d1 = myNormal.Value(i)
        const d = d1.Transformed(t1);

        normals[3 * (i - 1)] = d.X();
        normals[3 * (i - 1) + 1] = d.Y();
        normals[3 * (i - 1) + 2] = d.Z();

        t1.delete()
        d1.delete()
        d.delete()
      }

      myNormal.delete()

      // write triangle buffer
      const orient = myFace.Orientation_1();
      const triangles = myT.get().Triangles();


      let indices
      let triLength = triangles.Length() * 3
      if (triLength > 65535)
        indices = new Uint32Array(triLength)
      else
        indices = new Uint16Array(triLength)

      for (let nt = 1; nt <= myT.get().NbTriangles(); nt++) {
        const t = triangles.Value(nt);
        let n1 = t.Value(1);
        let n2 = t.Value(2);
        let n3 = t.Value(3);
        if (orient !== openCascade.TopAbs_Orientation.TopAbs_FORWARD) {
          let tmp = n1;
          n1 = n2;
          n2 = tmp;
        }

        indices[3 * (nt - 1)] = n1 - 1
        indices[3 * (nt - 1) + 1] = n2 - 1
        indices[3 * (nt - 1) + 2] = n3 - 1
        t.delete()
      }
      //orient.delete()
      triangles.delete()

      geometries.push({
        vertices, normals, indices
      });

      Nodes.delete()
      pc.delete()
      aLocation.delete()
      myT.delete()
      inc.delete()
      myFace.delete()
      myShape.delete()
    }
    ExpFace.delete()
    return geometries;
  }

}
