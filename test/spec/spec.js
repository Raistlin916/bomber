
var spriteFactory = bomb.spriteFactory
	, sheetMaker = bomb.sheetMaker
	, inputBoard = bomb.inputBoard
	, resource =  bomb.resource
	, GridStore = bomb.GridStore
	, unitFactory = bomb.unitFactory
	, Grid = bomb.Grid
	, foil = bomb.foil;

describe('util', function(){
	describe('foil',function(){
		it('.phase', function(){
			expect( foil.phase([3,-1]) ).toEqual([1,3,0,0]);
			expect( foil.phase([0,0]) ).toEqual([0,0,0,0]);
			expect( foil.phase([1,1]) ).toEqual([0,1,1,0]);
		});
		it('.reverse', function(){
			expect( foil.reverse([3,-1,2,1]) ).toEqual([2,1,3,-1]);
		});
	});
	
});

describe('sheetMaker', function(){
	it('interface', function(){
		expect( sheetMaker.row ).toBeDefined();
		expect( sheetMaker.col ).toBeDefined();
	});
	it('.row, .col return empty array when amount <= 0', function(){
		expect( sheetMaker.row(0,1,3,-1) ).toEqual([]);
		expect( sheetMaker.col(1,1,3,0) ).toEqual([]);
	});
	it('.row, .col', function(){
		var foo = sheetMaker.row(0,1,1,3);
		expect(foo).toEqual([[0,1],[1,1],[2,1]] );
		foo = sheetMaker.col(0,1,1,3);
		expect(foo).toEqual([[0,1],[0,2],[0,3]] );
	});
});

describe('Grid', function(){
	var grid;
	beforeEach(function(){
		grid = new Grid([30,30],[10,10], [1,1]);
	});
	it('interface', function(){
		expect( grid.format ).toBeDefined();
		expect( grid.cool ).toBeDefined();
		expect( grid.pos ).toBeDefined();
	});
	it('.format',function(){
		expect( grid.format([10,10]) ).toEqual([1,1]);
		expect( grid.format([30,40]) ).toEqual([31,31]);
		expect( grid.format([70,40]) ).toEqual([61,31]);
		expect( grid.format([60,60]) ).toEqual([61,61]);
	});
	it('.cool',function(){
		expect( grid.cool([30,10]) ).toEqual([0,0]);
		expect( grid.cool([40,10]) ).toEqual([1,0]);
		expect( grid.cool([31,10]) ).toEqual([1,0]);
	});

	it('.pos', function(){
		expect( grid.pos([1,1]) ).toEqual([31,31]);
		expect( grid.pos([3,1]) ).toEqual([91,31]);
	});
});

describe('GridStore', function(){
	var gridStore, u1, u2, u3;
	function build( pos ){
		return unitFactory.build( 'something', gridStore.format( pos ));
	}
	beforeEach(function(){
		gridStore = new GridStore([30,30],[10,10], [1,1]);
		u1 = build([10, 10]);
		u2 = build([32, 92]);
		u3 = build([63, 124]);
	});
	it('.depository', function(){
		expect( gridStore.depository() ).toEqual( [] );
	});
	it('.depository().push', function(){
		gridStore.depository().push(2);
		expect( gridStore.depository() ).toEqual( [2] );
	});
	it('.distance', function(){
		expect( gridStore.offset([30,10], [40,20]) ).toEqual([0,0]);
		expect( gridStore.offset([60,80], [40,20]) ).toEqual([0,2]);
		expect( gridStore.offset([20,80], [80,20]) ).toEqual([-2,2]);
	});
	it('.sniffing', function(){
		var dps = gridStore.depository();
		var cool = [1,2], range = [3,3];
		dps.push( u1 );
		dps.push( u2 );
		dps.push( u3 );

		expect(gridStore.sniffing( cool, range )).not.toContain( u1 );
		expect(gridStore.sniffing( cool, range )).toContain( u2 );
		expect(gridStore.sniffing( cool, range )).not.toContain( u3 );

	});
});

