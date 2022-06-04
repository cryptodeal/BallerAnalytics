import { NodeSingular } from 'cytoscape';
import { Link } from '../graph/Link';

/**
 * Gene is used to specify a Connection Gene
 * Nodes are represented using the NNode class,
 * which is both a genotypic and phenotypic
 * representation of nodes. Genetic representation
 * of connections uses this class as it calls for
 * special operations better served by a specific
 * genetic representation.
 *
 * Gene specifies a link between 2 nodes along w
 * an `innovationNum`, which tells when in the
 * history of a population the gene first arose.
 * This allows the system to track innovations and
 * use those to determine which organisms are
 * compatible (i.e. of the same species). `mutationNum`
 * gives rough idea of how much mutation the gene has
 * experienced from when it first appeared (since
 * innovation occurred). In current implementation,
 * the `mutationNum` is the same as the weight.
 */
export class Gene {
	/* link between nodes */
	public link: Link;
	/* current innovation number for this gene */
	public innovationNum: number;
	/* used to see how much mutation has changed the link */
	public mutationNum: number;
	/* true if gene is enabled */
	public isEnabled = false;

	constructor(link: Link, innovationNum: number, mutationNum: number, isEnabled = false) {
		this.link = link;
		this.innovationNum = innovationNum;
		this.mutationNum = mutationNum;
		this.isEnabled = isEnabled;
	}

	static newGene(
		weight: number,
		//inNode: NNode,
		outNode: NodeSingular,
		recurrent: boolean,
		innovationNum: number,
		mutationNum: number
	) {
		//const link = new Link(weight, inNode, outNode, recurrent);
		//return new Gene(link, innovationNum, mutationNum);
	}
}
